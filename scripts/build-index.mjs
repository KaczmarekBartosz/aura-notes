import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const root = process.cwd();
const sources = ['memory', 'outputs'];
const outDir = path.join(root, 'netlify/functions/data');
const outPath = path.join(outDir, 'notes-index.json');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) files.push(full);
  }
  return files;
}

function titleFrom(content, fallback) {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback.replace(/\.md$/i, '');
}

function excerptFrom(content) {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/[#>*_\-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.slice(0, 260);
}

function classify(rel, content) {
  const lowerRel = rel.toLowerCase();
  const lower = (rel + ' ' + content.slice(0, 1200)).toLowerCase();

  // 1) Path-first rules (most stable)
  if (
    lowerRel.includes('/cron-summaries/') ||
    lowerRel.includes('/x-bookmarks-sync/') ||
    /x-bookmarks-sync|sync-summary|glm-bookmark-sync|cron/.test(lowerRel)
  ) return 'cron-sync';

  if (/^memory\/\d{4}-\d{2}-\d{2}/.test(lowerRel)) return 'daily-log';

  // 2) Semantic rules
  if (/gold(_|\s|-)?[a-z0-9]*_?protocol|golden protocol|gold protocols/.test(lower)) return 'golden-protocols';
  if (/user_tastes|knowledge_tips|taste/.test(lower)) return 'taste';
  if (/peptyd|peptide|fitness|workout|training|nutrition|trening|whoop|plan trening/.test(lower)) return 'fitness-health';

  return 'other';
}

function detectTags(rel, content) {
  const hit = (rel + ' ' + content.slice(0, 1200)).match(/\b(gold|protocol|fitness|peptyd|peptide|taste|cron|bookmark|glm|aurafit|design|marketing|ai)\b/gi) || [];
  return [...new Set(hit.map(t => t.toLowerCase()))];
}

function semanticDateFromContentOrPath(rel, content) {
  const fm = content.slice(0, 1200);
  const dateMatch = fm.match(/^(last_updated|updated_at|updated|date)\s*:\s*"?([0-9]{4}-[0-9]{2}-[0-9]{2}(?:[T ][0-9:.+\-Z]+)?)"?/im);
  if (dateMatch?.[2]) {
    const d = new Date(dateMatch[2]);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  const headingDate = content.match(/^#\s*(20\d{2}-\d{2}-\d{2})\b/m);
  if (headingDate?.[1]) {
    const d = new Date(`${headingDate[1]}T12:00:00Z`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  const pathMatch = rel.match(/(20\d{2}-\d{2}-\d{2})(?:[^\d]|$)/);
  if (pathMatch?.[1]) {
    const d = new Date(`${pathMatch[1]}T12:00:00Z`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  return null;
}

function latestDateMention(content) {
  const sample = content.slice(0, 20000);
  const matches = [...sample.matchAll(/\b(20\d{2}-\d{2}-\d{2})(?:[T ]([0-9:.+\-Z]{2,}))?\b/g)];
  let best = null;
  for (const m of matches) {
    const isoCandidate = m[2] ? `${m[1]}T${m[2].replace(/^\s+/, '')}` : `${m[1]}T12:00:00Z`;
    const d = new Date(isoCandidate);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getTime() > Date.now() + 86400000) continue;
    if (!best || d > best) best = d;
  }
  return best ? best.toISOString() : null;
}

const gitDateCache = new Map();
const gitCreatedCache = new Map();

function gitCreatedAtFor(relPath, fallbackMtime) {
  if (gitCreatedCache.has(relPath)) return gitCreatedCache.get(relPath);
  try {
    const iso = execSync(`git log --diff-filter=A --format=%aI -- "${relPath.replace(/"/g, '\\"')}" | tail -n 1`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
    const val = iso || fallbackMtime.toISOString();
    gitCreatedCache.set(relPath, val);
    return val;
  } catch {
    const val = fallbackMtime.toISOString();
    gitCreatedCache.set(relPath, val);
    return val;
  }
}

function updatedAtFor(relPath, fallbackMtime, semanticIso = null, mentionIso = null) {
  if (gitDateCache.has(relPath)) return gitDateCache.get(relPath);
  try {
    const logs = execSync(`git log --format=%cI%x09%s -- "${relPath.replace(/"/g, '\\"')}"`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim().split('\n').filter(Boolean);

    let iso = '';
    for (const line of logs) {
      const [d, ...msgParts] = line.split('\t');
      const msg = (msgParts.join('\t') || '').toLowerCase();
      if (/sync notes from clawd|sync notes|x-bookmarks-sync/.test(msg)) continue;
      iso = d;
      break;
    }
    if (!iso && logs[0]) iso = logs[0].split('\t')[0] || '';

    let val = semanticIso || iso || fallbackMtime.toISOString();

    if (!semanticIso && mentionIso && iso) {
      const gitDate = new Date(iso);
      const mentionDate = new Date(mentionIso);
      if (!Number.isNaN(gitDate.getTime()) && !Number.isNaN(mentionDate.getTime())) {
        const diffDays = (gitDate.getTime() - mentionDate.getTime()) / 86400000;
        if (diffDays > 2) val = mentionIso;
      }
    }

    gitDateCache.set(relPath, val);
    return val;
  } catch {
    const val = semanticIso || mentionIso || fallbackMtime.toISOString();
    gitDateCache.set(relPath, val);
    return val;
  }
}

const notes = [];
for (const src of sources) {
  const srcDir = path.join(root, src);
  if (!fs.existsSync(srcDir)) continue;
  for (const f of walk(srcDir)) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    if (rel.includes('/_archive/')) continue;
    const content = fs.readFileSync(f, 'utf8');
    const stat = fs.statSync(f);
    const semanticIso = semanticDateFromContentOrPath(rel, content);
    const mentionIso = latestDateMention(content);
    const createdAt = gitCreatedAtFor(rel, stat.mtime);
    const words = content.replace(/```[\s\S]*?```/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
    notes.push({
      id: crypto.createHash('sha1').update(rel).digest('hex').slice(0, 12),
      path: rel,
      folder: src,
      category: classify(rel, content),
      title: titleFrom(content, path.basename(f)),
      excerpt: excerptFrom(content),
      createdAt,
      updatedAt: updatedAtFor(rel, stat.mtime, semanticIso, mentionIso),
      readingMinutes: Math.max(1, Math.round(words / 220)),
      words,
      tags: detectTags(rel, content),
      isHeavy: content.length > 180000,
      content
    });
  }
}

notes.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

const latestUpdatedAt = notes.length ? notes[0].updatedAt : null;

const payload = {
  generatedAt: new Date().toISOString(),
  latestUpdatedAt,
  count: notes.length,
  notes
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload));
console.log(`Built ${notes.length} notes -> ${path.relative(root, outPath)}`);
