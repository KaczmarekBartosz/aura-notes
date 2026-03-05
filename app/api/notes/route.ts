import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  // Dla dewelopmentu lokalnego ustawiane jest hasło na sztywno "local" by ułatwić pracę.
  // Jeśli zmienna systemowa jest dostępna, użyje jej.
  const expected = process.env.NOTEBOOK_PASSWORD || 'local';

  const headerPass = request.headers.get('x-aura-pass') || request.headers.get('X-Aura-Pass') || '';
  if (!headerPass || headerPass !== expected) {
    return NextResponse.json({ ok: false, authRequired: true }, { status: 401 });
  }

  try {
    const dataPath = path.join(process.cwd(), 'netlify/functions/data/notes-index.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'unknown';
    return NextResponse.json({ ok: false, error: 'Failed to load notes', detail }, { status: 500 });
  }
}
