import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const root = process.cwd();
const sources = ['memory', 'outputs'];
const outDir = path.join(root, 'netlify/functions/data');
const outPath = path.join(outDir, 'notes-index.json');
const catalogPath = path.join(root, 'outputs/INDEX_PLIKOW_MD.md');

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

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
}

function titleFrom(content, fallback) {
  const fm = parseFrontmatter(content);
  if (fm.title) return fm.title.trim();
  const m = stripFrontmatter(content).match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback.replace(/\.md$/i, '');
}

function excerptFrom(content) {
  const fm = parseFrontmatter(content);
  if (fm.excerpt) return String(fm.excerpt).trim().slice(0, 260);

  const body = stripFrontmatter(content);
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/[#>*_\-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.slice(0, 260);
}

function readFrontmatter(content) {
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return frontmatter?.[1] ?? '';
}

function parseFrontmatterList(content, key) {
  const raw = readFrontmatter(content);
  if (!raw) return [];

  const inline = raw.match(new RegExp(`^\\s*${key}\\s*:\\s*\\[(.*?)\\]\\s*$`, 'm'))?.[1];
  if (inline) {
    return inline
      .split(',')
      .map((item) => item.replace(/^['"\s]+|['"\s]+$/g, '').trim())
      .filter(Boolean);
  }

  const lines = raw.split(/\r?\n/);
  const collected = [];
  let inList = false;

  for (const line of lines) {
    if (!inList) {
      if (new RegExp(`^\\s*${key}\\s*:\\s*$`).test(line)) {
        inList = true;
      }
      continue;
    }

    const item = line.match(/^\s*-\s*(.*?)\s*$/)?.[1];
    if (item) {
      collected.push(item.replace(/^['"]|['"]$/g, '').trim());
      continue;
    }

    if (!line.trim()) continue;
    break;
  }

  return collected.filter(Boolean);
}

function parseFrontmatter(content) {
  const raw = readFrontmatter(content);
  const obj = {};
  if (!raw) return obj;
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([a-zA-Z0-9_\-]+)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    let val = m[2].replace(/^['"]|['"]$/g, '');
    obj[key] = val;
  }
  return obj;
}

function hasSystemFrontmatter(content) {
  const fm = parseFrontmatter(content);
  return (
    fm.category === 'system' ||
    fm.aura_category === 'system' ||
    fm.system === 'true'
  );
}

function hasIndexDisabled(content) {
  const fm = parseFrontmatter(content);
  return fm.index === 'false';
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

function shouldSkipFromIndex(rel, content) {
  const p = rel.toLowerCase();
  if (p.includes('/_archive/')) return true;
  return hasIndexDisabled(content);
}

function classify(rel, content) {
  const lowerRel = rel.toLowerCase();
  const lower = (rel + ' ' + content.slice(0, 1800)).toLowerCase();
  const fm = parseFrontmatter(content);

  if (fm.category && fm.category !== 'system') return fm.category;
  if (fm.aura_category && fm.aura_category !== 'system') return fm.aura_category;

  if (isSystemNote(rel, content)) return 'system';

  const isDatedLog = /^memory\/\d{4}-\d{2}-\d{2}/.test(lowerRel);
  if (isDatedLog && /peptyd|peptide|fitness|workout|training|nutrition|trening|whoop|plan trening|fat loss|protein/.test(lower)) return 'fitness-health';
  if (isDatedLog && /seo|aeo|geo|marketing|growth|acquisition|retention|pricing|distribution/.test(lower)) return 'growth-marketing';
  if (isDatedLog && /\b(ui|ux|design|typography|layout|figma|prototype|component|furniture|wizualizacje|nano banana)\b/.test(lower)) return 'design';
  if (isDatedLog && /openclaw|claude|codex|agent|subagent|mcp|llm|ai/.test(lower)) return 'ai-agents';

  if (isDatedLog) return 'daily-log';
  if (lowerRel.startsWith('outputs/')) return 'outputs';
  if (lowerRel.includes('/recipes/')) return 'recipes';
  if (/^memory\/x-bookmarks\.md$/.test(lowerRel)) return 'bookmarks';
  if (/^memory\/operations_critical_access\.md$/.test(lowerRel)) return 'system';

  if (/gold(_|\s|-)?[a-z0-9]*_?protocol|gold protocols/.test(lower) || /^memory\/gold_.*\.md$/.test(lowerRel)) return 'golden-protocols';
  if (/user_tastes|knowledge_tips|taste|psychografia|visual dna/.test(lower)) return 'taste';
  if (/peptyd|peptide|fitness|workout|training|nutrition|trening|whoop|plan trening|fat loss|protein/.test(lower)) return 'fitness-health';
  if (/seo|aeo|geo|marketing|growth|acquisition|retention|pricing|distribution/.test(lower)) return 'growth-marketing';
  if (/\b(ui|ux|design|typography|layout|figma|prototype|component|furniture|wizualizacje|nano banana)\b/.test(lower)) return 'design';
  if (/openclaw|claude|codex|agent|subagent|mcp|llm|ai/.test(lower)) return 'ai-agents';

  return 'knowledge';
}

function detectTags(rel, content) {
  const lower = (rel + ' ' + content.slice(0, 2200)).toLowerCase();
  const tags = new Set();
  const frontmatterTags = parseFrontmatterList(content, 'tags');

  for (const rawTag of frontmatterTags) {
    const normalized = rawTag.trim().toLowerCase();
    if (normalized) tags.add(normalized);
  }

  const dictionary = [
    ['openclaw', /\bopenclaw\b/],
    ['ai', /\b(ai|llm|agent|subagent|mcp)\b/],
    ['bookmark', /bookmark|zakład/],
    ['design', /\b(ui|ux|design|figma|typography|layout)\b/],
    ['marketing', /\b(marketing|growth|seo|aeo|geo|retention)\b/],
    ['fitness', /\b(fitness|workout|trening|protein|fat loss)\b/],
    ['peptides', /peptide|peptyd|retatrutide|mots-?c|tesamorelin/],
    ['protocol', /\bprotocol\b|protok/],
    ['memory', /\bmemory|obsidian|vault\b/]
  ];

  for (const [name, rx] of dictionary) {
    if (rx.test(lower)) tags.add(name);
  }

  return [...tags];
}

function parseAnyDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() > Date.now() + 86400000) return null;
  return d.toISOString();
}

function semanticDates(rel, content) {
  const fm = parseFrontmatter(content);
  const createdCandidates = [];
  const updatedCandidates = [];

  for (const key of ['created_at', 'created', 'date', 'data']) {
    const iso = parseAnyDate(fm[key]);
    if (iso) createdCandidates.push(iso);
  }

  for (const key of ['updated_at', 'updated', 'last_updated', 'modified']) {
    const iso = parseAnyDate(fm[key]);
    if (iso) updatedCandidates.push(iso);
  }

  const headerDate = content.match(/^#\s*(20\d{2}-\d{2}-\d{2})\b/m)?.[1];
  if (headerDate) {
    const iso = parseAnyDate(`${headerDate}T12:00:00Z`);
    if (iso) {
      createdCandidates.push(iso);
      updatedCandidates.push(iso);
    }
  }

  const pathDate = rel.match(/(20\d{2}-\d{2}-\d{2})(?:[^\d]|$)/)?.[1];
  if (pathDate) {
    const iso = parseAnyDate(`${pathDate}T12:00:00Z`);
    if (iso) createdCandidates.push(iso);
  }

  return { createdCandidates, updatedCandidates };
}

function newestIso(candidates, fallbackIso) {
  let best = null;
  for (const iso of candidates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    if (!best || d > best) best = d;
  }
  return best ? best.toISOString() : fallbackIso;
}

function oldestIso(candidates, fallbackIso) {
  let best = null;
  for (const iso of candidates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;
    if (!best || d < best) best = d;
  }
  return best ? best.toISOString() : fallbackIso;
}

const gitCreatedCache = new Map();
const gitUpdatedCache = new Map();

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
    const val = parseAnyDate(iso) || fallbackIso;
    gitCreatedCache.set(relPath, val);
    return val;
  } catch {
    gitCreatedCache.set(relPath, fallbackIso);
    return fallbackIso;
  }
}

function gitUpdatedAtFor(relPath, fallbackMtime) {
  if (gitUpdatedCache.has(relPath)) return gitUpdatedCache.get(relPath);
  const fallbackIso = fallbackMtime.toISOString();

  try {
    const log = execSync(`git log --format=%cI%x09%s -- "${relPath.replace(/"/g, '\\"')}"`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'ignore']
    }).toString();

    const lines = log.split('\n').filter(Boolean);
    const nonSync = lines.find((line) => {
      const msg = line.split('\t').slice(1).join('\t').toLowerCase();
      return !/sync notes from clawd|regenerate notes index|sync markdown notes/.test(msg);
    });

    const picked = nonSync || lines[0] || '';
    const iso = picked.split('\t')[0];
    const val = parseAnyDate(iso) || fallbackIso;
    gitUpdatedCache.set(relPath, val);
    return val;
  } catch {
    gitUpdatedCache.set(relPath, fallbackIso);
    return fallbackIso;
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
    const fallbackIso = stat.mtime.toISOString();
    const { createdCandidates, updatedCandidates } = semanticDates(rel, content);

    const gitCreated = gitCreatedAtFor(rel, stat.mtime);
    const gitUpdated = gitUpdatedAtFor(rel, stat.mtime);

    const createdAt = oldestIso([gitCreated, ...createdCandidates, fallbackIso], fallbackIso);
    const updatedAt = newestIso([fallbackIso, gitUpdated, ...updatedCandidates], fallbackIso);

    const words = stripFrontmatter(content)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean).length;

    notes.push({
      id: crypto.createHash('sha1').update(rel).digest('hex').slice(0, 12),
      path: rel,
      folder: src,
      category: classify(rel, content),
      title: titleFrom(content, path.basename(f)),
      excerpt: excerptFrom(content),
      createdAt,
      updatedAt,
      readingMinutes: Math.max(1, Math.round(words / 220)),
      words,
      tags: detectTags(rel, content),
      isHeavy: content.length > 180000,
      content
    });
  }
}

function validateNotesIndex(notesList) {
  const systemPathPattern = /(^memory\/(state|cron-summaries|x-bookmarks-sync|token-usage|perplexity-searches)\/)|(_GLM\.md$)|X_BOOKMARKS_SYNC_REGISTRY\.md$/i;

  const systemInFitness = notesList.filter((n) => n.category === 'fitness-health' && systemPathPattern.test(n.path));
  if (systemInFitness.length > 0) {
    throw new Error(`Invalid categorization: ${systemInFitness.length} system note(s) in fitness-health: ${systemInFitness.map(n => n.path).join(', ')}`);
  }

  const superhero = notesList.find((n) => n.path === 'memory/PROJEKT_SUPER_HERO_v2_1_FINAL.md');
  if (!superhero) {
    throw new Error('Critical note missing from index: memory/PROJEKT_SUPER_HERO_v2_1_FINAL.md');
  }

  const invalidDates = notesList.filter((n) => !n.createdAt || Number.isNaN(new Date(n.createdAt).getTime()) || Number.isNaN(new Date(n.updatedAt).getTime()));
  if (invalidDates.length > 0) {
    throw new Error(`Invalid dates in ${invalidDates.length} note(s)`);
  }
}

validateNotesIndex(notes);

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

// Build human-readable catalog
const byCategory = new Map();
for (const note of notes) {
  if (!byCategory.has(note.category)) byCategory.set(note.category, []);
  byCategory.get(note.category).push(note);
}

const sortedCategories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b, 'pl'));
const lines = [];
lines.push('---');
lines.push('index: false');
lines.push('category: system');
lines.push('---');
lines.push('');
lines.push('# INDEX PLIKÓW MD (AUTO)');
lines.push('');
lines.push(`Wygenerowano: ${new Date().toISOString()}`);
lines.push(`Liczba notatek: ${notes.length}`);
lines.push('');

for (const cat of sortedCategories) {
  const items = byCategory.get(cat).sort((a, b) => a.path.localeCompare(b.path, 'pl'));
  lines.push(`## ${cat} (${items.length})`);
  lines.push('');
  for (const n of items) {
    lines.push(`- **${n.path}**`);
    lines.push(`  - Tytuł: ${n.title}`);
    lines.push(`  - Utworzono: ${n.createdAt ?? '—'}`);
    lines.push(`  - Zaktualizowano: ${n.updatedAt}`);
    lines.push(`  - Opis: ${n.excerpt}`);
  }
  lines.push('');
}

fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
fs.writeFileSync(catalogPath, lines.join('\n'));

console.log(`Built ${notes.length} notes -> ${path.relative(root, outPath)}`);
console.log(`Built catalog -> ${path.relative(root, catalogPath)}`);
