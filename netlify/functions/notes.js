const crypto = require('crypto');

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

function cookieValue(cookieHeader, name) {
  const parts = (cookieHeader || '').split(';').map(s => s.trim());
  for (const p of parts) {
    if (p.startsWith(name + '=')) return p.slice(name.length + 1);
  }
  return '';
}

exports.handler = async (event) => {
  const expected = process.env.NOTEBOOK_PASSWORD || '';
  if (!expected) return json(500, { ok: false, error: 'Password not configured' });

  const expectedToken = crypto.createHash('sha256').update(expected).digest('hex');
  const cookie = event.headers.cookie || event.headers.Cookie || '';
  const session = cookieValue(cookie, 'aura_session');
  const headerToken = event.headers['x-aura-token'] || event.headers['X-Aura-Token'] || '';
  const headerPass = event.headers['x-aura-pass'] || event.headers['X-Aura-Pass'] || '';

  if ((!session || session !== expectedToken) && headerToken !== expectedToken && headerPass !== expected) {
    return json(401, { ok: false, authRequired: true });
  }

  try {
    // Use static require so Netlify bundle always includes the JSON asset.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const data = require('./data/notes-index.json');
    return json(200, { ok: true, data });
  } catch (e) {
    return json(500, {
      ok: false,
      error: 'Failed to load notes',
      detail: e && e.message ? e.message : 'unknown error',
    });
  }
};
