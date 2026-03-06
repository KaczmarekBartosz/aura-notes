import type { Note, NotesPayload } from "../types/note";
import { normalizeNotePayload } from "../utils/note-data";

const API_URL = process.env.EXPO_PUBLIC_NOTES_API_URL;
const API_PASSWORD = process.env.EXPO_PUBLIC_NOTES_PASSWORD;
const API_TIMEOUT_MS = 8000;

function parsePayload(json: any): NotesPayload | null {
  if (!json) return null;

  const notesSource = Array.isArray(json?.data?.notes)
    ? json.data.notes
    : Array.isArray(json?.notes)
      ? json.notes
      : null;

  if (!notesSource) return null;

  const notes = notesSource.map(normalizeNotePayload).filter((note: Note | null): note is Note => Boolean(note));

  return {
    notes,
    generatedAt: String(json?.data?.generatedAt ?? json?.generatedAt ?? new Date().toISOString()),
    latestUpdatedAt: json?.data?.latestUpdatedAt ?? json?.latestUpdatedAt ?? null
  };
}

export async function fetchNotesIndex(): Promise<NotesPayload | null> {
  if (!API_URL) return null;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (API_PASSWORD) {
    headers["x-aura-pass"] = API_PASSWORD;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const response = await fetch(API_URL, { headers, signal: controller.signal });
      if (!response.ok) return null;
      const json = await response.json();
      return parsePayload(json);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return null;
  }
}
