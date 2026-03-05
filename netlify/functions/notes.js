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

async function readNotesIndex() {
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const filePath = join(__dirname, 'data', 'notes-index.json');
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

exports.handler = async (event) => {
  const expected = process.env.NOTEBOOK_PASSWORD || '';
  if (!expected) return json(500, { ok: false, error: 'Password not configured' });

  const headerPass = event.headers['x-aura-pass'] || event.headers['X-Aura-Pass'] || '';
  if (!headerPass || headerPass !== expected) {
    return json(401, { ok: false, authRequired: true });
  }

  try {
    const data = await readNotesIndex();
    return json(200, { ok: true, data });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown';
    return json(500, { ok: false, error: 'Failed to load notes', detail });
  }
};
