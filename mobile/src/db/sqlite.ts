import * as SQLite from "expo-sqlite";
import type { Note } from "../types/note";
import { normalizeNotePayload } from "../utils/note-data";

const DB_NAME = "aura_notes.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

function safeParseNote(payload: string): Note | null {
  try {
    return normalizeNotePayload(JSON.parse(payload));
  } catch {
    return null;
  }
}

export async function initializeDb() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (
      note_id TEXT PRIMARY KEY NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
  `);
}

export async function readFavoriteIds(): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ note_id: string }>("SELECT note_id FROM favorites");
  return new Set(rows.map((row) => row.note_id));
}

export async function readCachedNotes(): Promise<Note[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ payload: string; favorite_id: string | null }>(`
    SELECT notes.payload, favorites.note_id as favorite_id
    FROM notes
    LEFT JOIN favorites ON favorites.note_id = notes.id
    ORDER BY notes.updated_at DESC
  `);

  return rows.flatMap((row) => {
      const note = safeParseNote(row.payload);
      return note ? [{ ...note, isFavorite: Boolean(row.favorite_id) }] : [];
    });
}

export async function writeNotesToCache(notes: Note[], generatedAt?: string) {
  const db = await getDb();
  const noteIds = [...new Set(notes.map((note) => note.id).filter(Boolean))];

  await db.withTransactionAsync(async () => {
    if (noteIds.length > 0) {
      const placeholders = noteIds.map(() => "?").join(", ");
      await db.runAsync(`DELETE FROM notes WHERE id NOT IN (${placeholders})`, ...noteIds);
      await db.runAsync(`DELETE FROM favorites WHERE note_id NOT IN (${placeholders})`, ...noteIds);
    } else {
      await db.execAsync(`
        DELETE FROM notes;
        DELETE FROM favorites;
      `);
    }

    for (const note of notes) {
      const payload = JSON.stringify({ ...note, isFavorite: undefined });
      const updatedAt = note.updatedAt || new Date().toISOString();

      await db.runAsync(
        `
          INSERT INTO notes (id, payload, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            payload = excluded.payload,
            updated_at = excluded.updated_at;
        `,
        note.id,
        payload,
        updatedAt
      );
    }
  });

  if (generatedAt) {
    await setMeta("last_generated_at", generatedAt);
  }
  await setMeta("last_synced_at", new Date().toISOString());
}

export async function toggleFavoriteInDb(noteId: string): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ note_id: string }>("SELECT note_id FROM favorites WHERE note_id = ?", noteId);

  if (existing) {
    await db.runAsync("DELETE FROM favorites WHERE note_id = ?", noteId);
    return false;
  }

  await db.runAsync("INSERT INTO favorites (note_id) VALUES (?)", noteId);
  return true;
}

export async function deleteNoteFromCache(noteId: string) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM notes WHERE id = ?", noteId);
    await db.runAsync("DELETE FROM favorites WHERE note_id = ?", noteId);
  });
  await setMeta("last_synced_at", new Date().toISOString());
}

export async function setMeta(key: string, value: string) {
  const db = await getDb();
  await db.runAsync(
    `
      INSERT INTO meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `,
    key,
    value
  );
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key = ?", key);
  return row?.value ?? null;
}

export async function getCacheStats() {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM notes");
  const lastSyncedAt = await getMeta("last_synced_at");
  return {
    count: Number(countRow?.count ?? 0),
    lastSyncedAt
  };
}

export async function clearCache() {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM notes;
    DELETE FROM favorites;
    DELETE FROM meta;
  `);
}
