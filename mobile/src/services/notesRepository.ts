import {
  clearCache,
  deleteNoteFromCache,
  getCacheStats,
  getMeta,
  initializeDb,
  readCachedNotes,
  setMeta,
  toggleFavoriteInDb,
  writeNotesToCache
} from "../db/sqlite";
import { clearReaderState } from "../state/readerState";
import type { ImportNotesResult, Note } from "../types/note";
import {
  normalizeImportFileName,
  parseImportedMarkdown,
  resolveNoteFileName
} from "../utils/note-data";
import {
  deleteMarkdownFromVault,
  pickMarkdownDocuments,
  readMarkdownAsset,
  resetVaultDirectory,
  writeMarkdownToVault
} from "./localVault";
import { readBundledNotes } from "./bundled-notes";
import { SEED_NOTES } from "./seed-notes";

const LOCAL_VAULT_VERSION = "local-v1";

export type NotesSource = "imported" | "seed";

export type NotesLoadResult = {
  notes: Note[];
  source: NotesSource;
};

function findMatchingNote(notes: Note[], fileName: string) {
  const normalizedFileName = normalizeImportFileName(fileName).toLowerCase();
  return notes.find((note) => resolveNoteFileName(note).toLowerCase() === normalizedFileName) ?? null;
}

async function materializeNotesInVault(sourceNotes: Note[]) {
  const importedAt = new Date().toISOString();
  const nextNotes: Note[] = [];

  for (const note of sourceNotes) {
    const fileName = resolveNoteFileName(note);
    if (!fileName || !note.content.trim()) continue;

    const localUri = await writeMarkdownToVault(fileName, note.content);
    const nextNote = parseImportedMarkdown({
      fileName,
      content: note.content,
      existingNote: note,
      localUri,
      importedAt,
      lastModified: note.updatedAt,
      preserveId: true
    });

    if (nextNote) {
      nextNotes.push(nextNote);
    }
  }

  return nextNotes;
}

async function ensureLocalVaultBootstrapped() {
  const currentVersion = await getMeta("local_vault_version");
  if (currentVersion === LOCAL_VAULT_VERSION) {
    return;
  }

  const cached = await readCachedNotes();
  const bundled = readBundledNotes();
  const sourceNotes = cached.length > 0 ? cached : bundled?.notes?.length ? bundled.notes : SEED_NOTES;
  const generatedAt = bundled?.generatedAt ?? new Date().toISOString();
  const materializedNotes = await materializeNotesInVault(sourceNotes);

  await writeNotesToCache(materializedNotes, generatedAt);
  await setMeta("local_vault_version", LOCAL_VAULT_VERSION);
  await setMeta("vault_mode", "imported");
  await setMeta("last_imported_at", new Date().toISOString());
}

export async function bootstrapNotes(): Promise<NotesLoadResult> {
  await initializeDb();
  await ensureLocalVaultBootstrapped();

  const cached = await readCachedNotes();
  if (cached.length > 0) {
    return { notes: cached, source: "imported" };
  }

  const seeded = await materializeNotesInVault(SEED_NOTES);
  await writeNotesToCache(seeded, new Date().toISOString());
  await setMeta("local_vault_version", LOCAL_VAULT_VERSION);
  await setMeta("vault_mode", "imported");
  await setMeta("last_imported_at", new Date().toISOString());

  return { notes: await readCachedNotes(), source: seeded.length > 0 ? "imported" : "seed" };
}

export async function syncNotes(): Promise<NotesLoadResult> {
  await initializeDb();
  await ensureLocalVaultBootstrapped();
  return {
    notes: await readCachedNotes(),
    source: "imported"
  };
}

export async function importNotesFromDevice(): Promise<ImportNotesResult> {
  await initializeDb();
  await ensureLocalVaultBootstrapped();

  const pickedAssets = await pickMarkdownDocuments();
  if (!pickedAssets?.length) {
    return {
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: [],
      totalSelected: 0
    };
  }

  const currentNotes = await readCachedNotes();
  const nextNotesById = new Map(currentNotes.map((note) => [note.id, note]));
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const failed: string[] = [];
  const importedAt = new Date().toISOString();

  for (const asset of pickedAssets) {
    const fileName = normalizeImportFileName(asset.name);
    if (!fileName.toLowerCase().endsWith(".md")) {
      failed.push(asset.name);
      continue;
    }

    try {
      const content = await readMarkdownAsset(asset.uri);
      if (!content.trim()) {
        failed.push(asset.name);
        continue;
      }

      const existingNote = findMatchingNote([...nextNotesById.values()], fileName);
      const parsedNote = parseImportedMarkdown({
        fileName,
        content,
        existingNote,
        importedAt,
        lastModified: asset.lastModified ? new Date(asset.lastModified).toISOString() : undefined
      });

      if (!parsedNote) {
        failed.push(asset.name);
        continue;
      }

      if (existingNote?.checksum && existingNote.checksum === parsedNote.checksum) {
        skipped += 1;
        continue;
      }

      const localUri = await writeMarkdownToVault(fileName, content);
      const finalNote = { ...parsedNote, localUri };

      nextNotesById.set(finalNote.id, finalNote);
      if (existingNote) {
        updated += 1;
      } else {
        imported += 1;
      }
    } catch {
      failed.push(asset.name);
    }
  }

  await writeNotesToCache([...nextNotesById.values()], importedAt);
  await setMeta("local_vault_version", LOCAL_VAULT_VERSION);
  await setMeta("vault_mode", "imported");
  await setMeta("last_imported_at", importedAt);

  return {
    imported,
    updated,
    skipped,
    failed,
    totalSelected: pickedAssets.length
  };
}

export async function deleteImportedNote(noteId: string): Promise<boolean> {
  await initializeDb();
  await ensureLocalVaultBootstrapped();

  const currentNotes = await readCachedNotes();
  const note = currentNotes.find((entry) => entry.id === noteId);
  if (!note) {
    return false;
  }

  await deleteMarkdownFromVault(note.localUri);
  await deleteNoteFromCache(noteId);
  await clearReaderState(noteId);
  await setMeta("last_imported_at", new Date().toISOString());
  return true;
}

export async function toggleFavorite(noteId: string): Promise<boolean> {
  await initializeDb();
  return toggleFavoriteInDb(noteId);
}

export async function readCacheInfo() {
  await initializeDb();
  return getCacheStats();
}

export async function clearLocalCache() {
  await initializeDb();
  await resetVaultDirectory();
  await clearCache();
}
