import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const sources = ['memory', 'outputs'];
const outDir = path.join(root, 'public');
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
  const lower = (rel + ' ' + content.slice(0, 1200)).toLowerCase();
  if (/gold(_|\s|-)?[a-z0-9]*_?protocol|golden protocol|gold protocols/.test(lower)) return 'golden-protocols';
  if (/user_tastes|knowledge_tips|taste/.test(lower)) return 'taste';
  if (/peptyd|peptide|fitness|workout|nutrition/.test(lower)) return 'fitness-health';
  if (/cron|sync|bookmarks/.test(lower)) return 'cron-sync';
  if (/^memory\/\d{4}-\d{2}-\d{2}/.test(rel)) return 'daily-log';
  return 'other';
}

function detectTags(rel, content) {
  const hit = (rel + ' ' + content.slice(0, 1200)).match(/\b(gold|protocol|fitness|peptyd|peptide|taste|cron|bookmark|glm|aurafit|design|marketing|ai)\b/gi) || [];
  return [...new Set(hit.map(t => t.toLowerCase()))];
}

const notes = [];
for (const src of sources) {
  const srcDir = path.join(root, src);
  if (!fs.existsSync(srcDir)) continue;
  for (const f of walk(srcDir)) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    const content = fs.readFileSync(f, 'utf8');
    const stat = fs.statSync(f);
    notes.push({
      id: crypto.createHash('sha1').update(rel).digest('hex').slice(0, 12),
      path: rel,
      folder: src,
      category: classify(rel, content),
      title: titleFrom(content, path.basename(f)),
      excerpt: excerptFrom(content),
      updatedAt: stat.mtime.toISOString(),
      tags: detectTags(rel, content),
      content
    });
  }
}

notes.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

const password = process.env.NOTEBOOK_PASSWORD || '';
const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;

const payload = {
  generatedAt: new Date().toISOString(),
  count: notes.length,
  auth: {
    enabled: Boolean(passwordHash),
    hint: passwordHash ? 'Set NOTEBOOK_PASSWORD in Netlify env' : 'No password configured',
    sha256: passwordHash
  },
  notes
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload));
console.log(`Built ${notes.length} notes -> ${path.relative(root, outPath)}`);
