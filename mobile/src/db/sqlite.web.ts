import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Note } from "../types/note";
import { normalizeNotePayload } from "../utils/note-data";

const NOTES_KEY = "aura-notes.web.notes";
const FAVORITES_KEY = "aura-notes.web.favorites";
const META_KEY = "aura-notes.web.meta";

type MetaRecord = Record<string, string>;

async function readNotesMap(): Promise<Record<string, Note>> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, normalizeNotePayload(value)])
        .filter((entry): entry is [string, Note] => Boolean(entry[1]))
    );
  } catch {
    return {};
  }
}

async function writeNotesMap(next: Record<string, Note>) {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
}

async function readFavorites(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function writeFavorites(favorites: Set<string>) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

async function readMetaMap(): Promise<MetaRecord> {
  const raw = await AsyncStorage.getItem(META_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as MetaRecord;
  } catch {
    return {};
  }
}

async function writeMetaMap(next: MetaRecord) {
  await AsyncStorage.setItem(META_KEY, JSON.stringify(next));
}

export async function initializeDb() {
  return;
}

export async function readFavoriteIds(): Promise<Set<string>> {
  return readFavorites();
}

export async function readCachedNotes(): Promise<Note[]> {
  const [notesMap, favorites] = await Promise.all([readNotesMap(), readFavorites()]);
  return Object.values(notesMap)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((note) => ({ ...note, isFavorite: favorites.has(note.id) }));
}

export async function writeNotesToCache(notes: Note[], generatedAt?: string) {
  const next: Record<string, Note> = {};
  notes.forEach((note) => {
    next[note.id] = { ...note, isFavorite: undefined };
  });
  const favorites = await readFavorites();
  const validIds = new Set(Object.keys(next));
  const nextFavorites = new Set([...favorites].filter((noteId) => validIds.has(noteId)));

  await Promise.all([writeNotesMap(next), writeFavorites(nextFavorites)]);

  if (generatedAt) {
    await setMeta("last_generated_at", generatedAt);
  }
  await setMeta("last_synced_at", new Date().toISOString());
}

export async function toggleFavoriteInDb(noteId: string): Promise<boolean> {
  const favorites = await readFavorites();
  if (favorites.has(noteId)) {
    favorites.delete(noteId);
    await writeFavorites(favorites);
    return false;
  }

  favorites.add(noteId);
  await writeFavorites(favorites);
  return true;
}

export async function deleteNoteFromCache(noteId: string) {
  const notes = await readNotesMap();
  const favorites = await readFavorites();
  delete notes[noteId];
  favorites.delete(noteId);
  await Promise.all([writeNotesMap(notes), writeFavorites(favorites)]);
  await setMeta("last_synced_at", new Date().toISOString());
}

export async function setMeta(key: string, value: string) {
  const meta = await readMetaMap();
  meta[key] = value;
  await writeMetaMap(meta);
}

export async function getMeta(key: string): Promise<string | null> {
  const meta = await readMetaMap();
  return meta[key] ?? null;
}

export async function getCacheStats() {
  const notes = await readNotesMap();
  const lastSyncedAt = await getMeta("last_synced_at");
  return {
    count: Object.keys(notes).length,
    lastSyncedAt
  };
}

export async function clearCache() {
  await AsyncStorage.multiRemove([NOTES_KEY, FAVORITES_KEY, META_KEY]);
}
