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

exports.handler = async (event) => {
  const expected = process.env.NOTEBOOK_PASSWORD || '';
  if (!expected) return json(500, { ok: false, error: 'Password not configured' });

  const headerPass = event.headers['x-aura-pass'] || event.headers['X-Aura-Pass'] || '';
  if (!headerPass || headerPass !== expected) {
    return json(401, { ok: false, authRequired: true });
  }

  try {
    const data = require('./data/notes-index.json');
    return json(200, { ok: true, data });
  } catch (e) {
    return json(500, { ok: false, error: 'Failed to load notes', detail: e?.message || 'unknown' });
  }
};
