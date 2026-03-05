import { clearCache, getCacheStats, initializeDb, readCachedNotes, toggleFavoriteInDb, writeNotesToCache } from "../db/sqlite";
import type { Note } from "../types/note";
import { fetchNotesIndex } from "./api";
import { readBundledNotes } from "./bundled-notes";
import { SEED_NOTES } from "./seed-notes";

export type NotesSource = "api" | "cache" | "bundled" | "seed";

export type NotesLoadResult = {
  notes: Note[];
  source: NotesSource;
};

async function hydrateFromBundledOrSeed(): Promise<NotesLoadResult> {
  const bundled = readBundledNotes();
  if (bundled && bundled.notes.length > 0) {
    await writeNotesToCache(bundled.notes, bundled.generatedAt);
    const bundledCached = await readCachedNotes();
    return { notes: bundledCached, source: "bundled" };
  }

  await writeNotesToCache(SEED_NOTES, new Date().toISOString());
  const seeded = await readCachedNotes();
  return { notes: seeded, source: "seed" };
}

export async function bootstrapNotes(): Promise<NotesLoadResult> {
  await initializeDb();
  const cached = await readCachedNotes();
  if (cached.length > 0) {
    return { notes: cached, source: "cache" };
  }

  return hydrateFromBundledOrSeed();
}

export async function syncNotes(): Promise<NotesLoadResult> {
  await initializeDb();
  const payload = await fetchNotesIndex();

  if (!payload || payload.notes.length === 0) {
    const cached = await readCachedNotes();
    if (cached.length > 0) {
      return { notes: cached, source: "cache" };
    }
    return hydrateFromBundledOrSeed();
  }

  await writeNotesToCache(payload.notes, payload.generatedAt);
  const cached = await readCachedNotes();
  return { notes: cached, source: "api" };
}

export async function toggleFavorite(noteId: string): Promise<Note[]> {
  await initializeDb();
  await toggleFavoriteInDb(noteId);
  return readCachedNotes();
}

export async function readCacheInfo() {
  await initializeDb();
  return getCacheStats();
}

export async function clearLocalCache() {
  await initializeDb();
  await clearCache();
}
