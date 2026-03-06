import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  // Dla dewelopmentu lokalnego ustawiane jest hasło na sztywno "local" by ułatwić pracę.
  // Jeśli zmienna systemowa jest dostępna, użyje jej.
  const expected = String(process.env.NOTEBOOK_PASSWORD || 'local').trim();

  const headerPass = String(
    request.headers.get('x-aura-pass') || request.headers.get('X-Aura-Pass') || ''
  ).trim();
  if (!headerPass || headerPass !== expected) {
    return NextResponse.json({ ok: false, authRequired: true }, { status: 401 });
  }

  try {
    const dataPath = path.join(process.cwd(), 'netlify/functions/data/notes-index.json');
    const raw = await readFile(dataPath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'unknown';
    return NextResponse.json({ ok: false, error: 'Failed to load notes', detail }, { status: 500 });
  }
}
