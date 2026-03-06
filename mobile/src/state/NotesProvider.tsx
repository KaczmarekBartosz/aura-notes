import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import {
  bootstrapNotes,
  clearLocalCache,
  deleteImportedNote,
  importNotesFromDevice,
  readCacheInfo,
  syncNotes,
  toggleFavorite
} from "../services/notesRepository";
import type { ImportNotesResult, Note } from "../types/note";
import { buildNotesSignature } from "../utils/note-data";

type NotesContextValue = {
  notes: Note[];
  loading: boolean;
  refreshing: boolean;
  importing: boolean;
  source: "imported" | "seed" | "boot";
  error: string | null;
  cacheInfo: {
    count: number;
    lastSyncedAt: string | null;
  };
  refresh: () => Promise<void>;
  importNotes: () => Promise<ImportNotesResult>;
  deleteNoteById: (noteId: string) => Promise<boolean>;
  toggleFavoriteById: (noteId: string) => Promise<void>;
  resetCache: () => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

const EMPTY_IMPORT_RESULT: ImportNotesResult = {
  imported: 0,
  updated: 0,
  skipped: 0,
  failed: [],
  totalSelected: 0
};

export function NotesProvider({ children }: PropsWithChildren) {
  const isMountedRef = useRef(true);
  const busyRef = useRef(false);
  const notesSignatureRef = useRef("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [source, setSource] = useState<"imported" | "seed" | "boot">("boot");
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ count: number; lastSyncedAt: string | null }>({
    count: 0,
    lastSyncedAt: null
  });

  const applyNotes = useCallback((nextNotes: Note[]) => {
    const nextSignature = buildNotesSignature(nextNotes);
    if (nextSignature === notesSignatureRef.current) {
      return;
    }

    notesSignatureRef.current = nextSignature;
    setNotes(nextNotes);
  }, []);

  const updateCacheInfo = useCallback((nextCacheInfo: { count: number; lastSyncedAt: string | null }) => {
    setCacheInfo((current) => {
      if (current.count === nextCacheInfo.count && current.lastSyncedAt === nextCacheInfo.lastSyncedAt) {
        return current;
      }
      return nextCacheInfo;
    });
  }, []);

  const reloadCacheInfo = useCallback(async () => {
    const next = await readCacheInfo();
    if (isMountedRef.current) {
      updateCacheInfo(next);
    }
    return next;
  }, [updateCacheInfo]);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current || busyRef.current) return;

    busyRef.current = true;
    setRefreshing(true);
    setError(null);

    try {
      const result = await syncNotes();
      await reloadCacheInfo();
      if (!isMountedRef.current) return;
      applyNotes(result.notes);
      setSource(result.source);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Nie udało się odświeżyć lokalnego vaultu.");
      }
    } finally {
      busyRef.current = false;
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [applyNotes, reloadCacheInfo]);

  const importNotes = useCallback(async () => {
    if (!isMountedRef.current || busyRef.current) return EMPTY_IMPORT_RESULT;

    busyRef.current = true;
    setImporting(true);
    setError(null);

    try {
      const result = await importNotesFromDevice();
      const reloaded = await syncNotes();
      await reloadCacheInfo();
      if (!isMountedRef.current) return result;
      applyNotes(reloaded.notes);
      setSource(reloaded.source);
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Nie udało się zaimportować notatek.");
      }
      return EMPTY_IMPORT_RESULT;
    } finally {
      busyRef.current = false;
      if (isMountedRef.current) {
        setImporting(false);
      }
    }
  }, [applyNotes, reloadCacheInfo]);

  const deleteNoteById = useCallback(
    async (noteId: string) => {
      if (!isMountedRef.current || busyRef.current) return false;

      busyRef.current = true;
      setError(null);

      try {
        const deleted = await deleteImportedNote(noteId);
        const reloaded = await syncNotes();
        await reloadCacheInfo();
        if (!isMountedRef.current) return deleted;
        applyNotes(reloaded.notes);
        setSource(reloaded.source);
        return deleted;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : "Nie udało się usunąć notatki.");
        }
        return false;
      } finally {
        busyRef.current = false;
      }
    },
    [applyNotes, reloadCacheInfo]
  );

  const toggleFavoriteById = useCallback(
    async (noteId: string) => {
      const currentFavorite = Boolean(notes.find((note) => note.id === noteId)?.isFavorite);
      const optimisticFavorite = !currentFavorite;

      setNotes((current) => {
        const nextNotes = current.map((note) => (note.id === noteId ? { ...note, isFavorite: optimisticFavorite } : note));
        notesSignatureRef.current = buildNotesSignature(nextNotes);
        return nextNotes;
      });

      try {
        const persistedFavorite = await toggleFavorite(noteId);
        if (!isMountedRef.current) return;

        if (persistedFavorite !== optimisticFavorite) {
          setNotes((current) => {
            const nextNotes = current.map((note) => (note.id === noteId ? { ...note, isFavorite: persistedFavorite } : note));
            notesSignatureRef.current = buildNotesSignature(nextNotes);
            return nextNotes;
          });
        }

        await reloadCacheInfo();
      } catch {
        if (!isMountedRef.current) return;
        setNotes((current) => {
          const nextNotes = current.map((note) => (note.id === noteId ? { ...note, isFavorite: currentFavorite } : note));
          notesSignatureRef.current = buildNotesSignature(nextNotes);
          return nextNotes;
        });
      }
    },
    [notes, reloadCacheInfo]
  );

  const resetCache = useCallback(async () => {
    if (!isMountedRef.current || busyRef.current) return;

    busyRef.current = true;
    setRefreshing(true);
    setError(null);

    try {
      await clearLocalCache();
      const initial = await bootstrapNotes();
      if (!isMountedRef.current) return;
      applyNotes(initial.notes);
      setSource(initial.source);
      await reloadCacheInfo();
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Nie udało się przywrócić lokalnego vaultu.");
      }
    } finally {
      busyRef.current = false;
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [applyNotes, reloadCacheInfo]);

  useEffect(() => {
    isMountedRef.current = true;
    let mounted = true;

    (async () => {
      try {
        const initial = await bootstrapNotes();
        if (!mounted) return;
        applyNotes(initial.notes);
        setSource(initial.source);
        await reloadCacheInfo();
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Nie udało się uruchomić aplikacji.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      isMountedRef.current = false;
    };
  }, [applyNotes, reloadCacheInfo]);

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      loading,
      refreshing,
      importing,
      source,
      error,
      cacheInfo,
      refresh,
      importNotes,
      deleteNoteById,
      toggleFavoriteById,
      resetCache
    }),
    [notes, loading, refreshing, importing, source, error, cacheInfo, refresh, importNotes, deleteNoteById, toggleFavoriteById, resetCache]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used inside NotesProvider");
  }
  return context;
}
