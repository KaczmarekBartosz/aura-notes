const fs = require('fs');
const path = require('path');
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

  if ((!session || session !== expectedToken) && headerToken !== expectedToken) {
    return json(401, { ok: false, authRequired: true });
  }

  try {
    const p = path.join(__dirname, 'data', 'notes-index.json');
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    return json(200, { ok: true, data });
  } catch (e) {
    return json(500, { ok: false, error: 'Failed to load notes' });
  }
};
