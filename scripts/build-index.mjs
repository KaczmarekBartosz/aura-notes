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

  if (isSystemNote(rel, content)) return 'system';

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

function readFrontmatter(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return frontmatter?.[1] ?? '';
}

function hasSystemFrontmatter(content) {
  const frontmatter = readFrontmatter(content);
  if (!frontmatter) return false;
  if (/^\s*(category|aura_category)\s*:\s*system\s*$/im.test(frontmatter)) return true;
  if (/^\s*system\s*:\s*true\s*$/im.test(frontmatter)) return true;
  return false;
}

function isSystemNote(rel, content) {
  const p = rel.toLowerCase();
  if (hasSystemFrontmatter(content)) return true;

  if (
    p.startsWith('memory/cron-summaries/') ||
    p.startsWith('memory/x-bookmarks-sync/') ||
    p.startsWith('memory/perplexity-searches/') ||
    p.startsWith('memory/state/') ||
    p.startsWith('memory/token-usage/')
  ) return true;

  if (/^memory\/x-bookmarks-sync-\d{4}-\d{2}-\d{2}/.test(p)) return true;
  if (/(^|\/)(x_bookmarks_sync_registry|x-bookmarks-sync-summary|token_history_full)\.md$/.test(p)) return true;
  if (/(^|\/)batch_\d+_\d+_(analysis|report)\.md$/.test(p)) return true;
  if (/(^|\/)glm_analysis_batch_\d+_\d+\.md$/.test(p)) return true;
  if (/[-_]glm\.md$/.test(p)) return true;
  if (/sync-summary/.test(p)) return true;

  return false;
}

function hasIndexDisabled(content) {
  const frontmatter = readFrontmatter(content);
  if (!frontmatter) return false;
  return /^\s*index\s*:\s*false\s*$/im.test(frontmatter);
}

function shouldSkipFromIndex(rel, content) {
  const p = rel.toLowerCase();

  if (p.includes('/_archive/')) return true;
  return hasIndexDisabled(content);
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

function newestIso(candidates, fallbackIso) {
  let best = null;
  for (const iso of candidates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getTime() > Date.now() + 86400000) continue;
    if (!best || d > best) best = d;
  }
  return best ? best.toISOString() : fallbackIso;
}

const gitDateCache = new Map();
const gitCreatedCache = new Map();

function gitCreatedAtFor(relPath, fallbackMtime) {
  if (gitCreatedCache.has(relPath)) return gitCreatedCache.get(relPath);
  const fallbackIso = fallbackMtime.toISOString();
  try {
    const history = execSync(`git log --diff-filter=A --format=%aI -- "${relPath.replace(/"/g, '\\"')}"`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();
    const lines = history.split('\n').filter(Boolean);
    const iso = lines[lines.length - 1] || '';
    const val = newestIso([iso], fallbackIso);
    gitCreatedCache.set(relPath, val);
    return val;
  } catch {
    const val = fallbackIso;
    gitCreatedCache.set(relPath, val);
    return val;
  }
}

function updatedAtFor(relPath, fallbackMtime, semanticIso = null) {
  if (gitDateCache.has(relPath)) return gitDateCache.get(relPath);
  const fallbackIso = fallbackMtime.toISOString();
  try {
    const gitIso = execSync(`git log -n 1 --format=%cI -- "${relPath.replace(/"/g, '\\"')}"`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString().trim();

    const val = newestIso([gitIso, semanticIso], fallbackIso);

    gitDateCache.set(relPath, val);
    return val;
  } catch {
    const val = newestIso([semanticIso], fallbackIso);
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
    const content = fs.readFileSync(f, 'utf8');
    if (shouldSkipFromIndex(rel, content)) continue;
    const stat = fs.statSync(f);
    const semanticIso = semanticDateFromContentOrPath(rel, content);
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
      updatedAt: updatedAtFor(rel, stat.mtime, semanticIso),
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
