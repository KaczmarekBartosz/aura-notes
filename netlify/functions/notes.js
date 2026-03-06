function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

// Module-level cache — populated once per Lambda container lifecycle (warm starts reuse it)
let notesIndexCache = null;

function getNotesIndex() {
  if (notesIndexCache) return notesIndexCache;

  // 1) Prefer static require so Netlify bundler keeps JSON with function package.
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    notesIndexCache = require('./data/notes-index.json');
    return notesIndexCache;
  } catch {}

  // 2) Fallbacks for local/dev and bundle path differences.
  const { join } = require('node:path');
  const { readFileSync } = require('node:fs');

  const candidates = [
    join(__dirname, 'data', 'notes-index.json'),
    join(process.cwd(), 'netlify', 'functions', 'data', 'notes-index.json'),
    join(process.cwd(), '.netlify', 'functions', 'notes', 'data', 'notes-index.json'),
    join(process.cwd(), '.netlify', 'functions-serve', 'notes', 'data', 'notes-index.json'),
  ];

  let lastError = null;
  for (const filePath of candidates) {
    try {
      notesIndexCache = JSON.parse(readFileSync(filePath, 'utf-8'));
      return notesIndexCache;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('notes-index.json not found in known locations');
}

exports.handler = async (event) => {
  const expected = String(process.env.NOTEBOOK_PASSWORD || '').trim();
  if (!expected) return json(500, { ok: false, error: 'Password not configured' });

  const headers = event.headers || {};
  const headerPassRaw = headers['x-aura-pass'] || headers['X-Aura-Pass'] || '';
  const headerPass = String(headerPassRaw).trim();
  if (!headerPass || headerPass !== expected) {
    return json(401, { ok: false, authRequired: true });
  }

  try {
    const data = getNotesIndex();
    return json(200, { ok: true, data });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown';
    return json(500, { ok: false, error: 'Failed to load notes', detail });
  }
};
