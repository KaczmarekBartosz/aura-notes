const crypto = require('crypto');

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false });

  const expected = process.env.NOTEBOOK_PASSWORD || '';
  if (!expected) return json(500, { ok: false, error: 'Password not configured' });

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch {}

  if (!payload.password || payload.password !== expected) {
    return json(401, { ok: false, error: 'Invalid password' });
  }

  const token = crypto.createHash('sha256').update(expected).digest('hex');
  const cookie = `aura_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
  return json(200, { ok: true, token }, { 'Set-Cookie': cookie });
};
