import type { Note } from "../types/note";
import { normalizeNotePayload } from "../utils/note-data";

type BundledPayload = {
  generatedAt?: string;
  latestUpdatedAt?: string | null;
  notes?: Note[];
};

let cachedPayload: BundledPayload | null = null;

function parseBundledPayload(raw: any): BundledPayload {
  const notes = Array.isArray(raw?.notes)
    ? raw.notes.map(normalizeNotePayload).filter((note: Note | null): note is Note => Boolean(note))
    : [];
  return {
    generatedAt: typeof raw?.generatedAt === "string" ? raw.generatedAt : new Date().toISOString(),
    latestUpdatedAt: raw?.latestUpdatedAt ?? null,
    notes
  };
}

export function readBundledNotes(): { notes: Note[]; generatedAt: string } | null {
  try {
    if (!cachedPayload) {
      const bundled = require("../../assets/notes-index.json");
      cachedPayload = parseBundledPayload(bundled);
    }

    const notes = (cachedPayload.notes ?? []).filter((note) => typeof note?.id === "string");
    if (notes.length === 0) return null;

    return {
      notes,
      generatedAt: cachedPayload.generatedAt ?? new Date().toISOString()
    };
  } catch {
    return null;
  }
}
