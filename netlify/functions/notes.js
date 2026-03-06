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
  if (!notesIndexCache) {
    const { join } = require('node:path');
    const { readFileSync } = require('node:fs');
    const filePath = join(__dirname, 'data', 'notes-index.json');
    notesIndexCache = JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return notesIndexCache;
}

exports.handler = async (event) => {
  const expected = process.env.NOTEBOOK_PASSWORD || '';
  if (!expected) return json(500, { ok: false, error: 'Password not configured' });

  const headerPass = event.headers['x-aura-pass'] || event.headers['X-Aura-Pass'] || '';
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
