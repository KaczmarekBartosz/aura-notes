import type { Note, NotesPayload } from "../types/note";

const API_URL = process.env.EXPO_PUBLIC_NOTES_API_URL;
const API_PASSWORD = process.env.EXPO_PUBLIC_NOTES_PASSWORD;

function normalizeNote(raw: any): Note | null {
  if (!raw || typeof raw.id !== "string" || typeof raw.title !== "string") return null;

  return {
    id: raw.id,
    path: String(raw.path ?? ""),
    folder: String(raw.folder ?? ""),
    category: String(raw.category ?? "other"),
    title: String(raw.title ?? ""),
    excerpt: String(raw.excerpt ?? ""),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    readingMinutes: Number(raw.readingMinutes ?? 1),
    words: Number(raw.words ?? 0),
    tags: Array.isArray(raw.tags) ? raw.tags.map((tag: unknown) => String(tag)) : [],
    content: String(raw.content ?? ""),
    isFavorite: Boolean(raw.isFavorite)
  };
}

function parsePayload(json: any): NotesPayload | null {
  if (!json) return null;

  const notesSource = Array.isArray(json?.data?.notes)
    ? json.data.notes
    : Array.isArray(json?.notes)
      ? json.notes
      : null;

  if (!notesSource) return null;

  const notes = notesSource.map(normalizeNote).filter((note: Note | null): note is Note => Boolean(note));

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
    const response = await fetch(API_URL, { headers });
    if (!response.ok) return null;
    const json = await response.json();
    return parsePayload(json);
  } catch {
    return null;
  }
}
