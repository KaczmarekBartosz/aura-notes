import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { AppState, type AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import type { Note } from "../types/note";
import { bootstrapNotes, clearLocalCache, readCacheInfo, syncNotes, toggleFavorite } from "../services/notesRepository";
import { buildNotesSignature } from "../utils/note-data";

type NotesContextValue = {
  notes: Note[];
  loading: boolean;
  refreshing: boolean;
  source: "api" | "cache" | "bundled" | "seed" | "boot";
  error: string | null;
  cacheInfo: {
    count: number;
    lastSyncedAt: string | null;
  };
  refresh: () => Promise<void>;
  toggleFavoriteById: (noteId: string) => Promise<void>;
  resetCache: () => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: PropsWithChildren) {
  const isMountedRef = useRef(true);
  const refreshInFlightRef = useRef(false);
  const notesSignatureRef = useRef("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<"api" | "cache" | "bundled" | "seed" | "boot">("boot");
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

  const runRefresh = useCallback(
    async (showSpinner: boolean) => {
      if (!isMountedRef.current || refreshInFlightRef.current) return;

      refreshInFlightRef.current = true;
      if (showSpinner && isMountedRef.current) {
        setRefreshing(true);
      }
      setError(null);

      try {
        const result = await syncNotes();
        await reloadCacheInfo();
        if (!isMountedRef.current) return;
        applyNotes(result.notes);
        setSource((current) => (current === result.source ? current : result.source));
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : "Nie udało się odświeżyć notatek.");
        }
      } finally {
        refreshInFlightRef.current = false;
        if (showSpinner && isMountedRef.current) {
          setRefreshing(false);
        }
      }
    },
    [applyNotes, reloadCacheInfo, updateCacheInfo]
  );

  const refresh = useCallback(async () => {
    await runRefresh(true);
  }, [runRefresh]);

  const backgroundRefresh = useCallback(async () => {
    await runRefresh(false);
  }, [runRefresh]);

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
    await clearLocalCache();
    const initial = await bootstrapNotes();
    applyNotes(initial.notes);
    setSource(initial.source);
    await reloadCacheInfo();
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

      if (!mounted) return;
      await backgroundRefresh();
    })();

    return () => {
      mounted = false;
      isMountedRef.current = false;
    };
  }, [applyNotes, backgroundRefresh, reloadCacheInfo]);

  useEffect(() => {
    let currentAppState: AppStateStatus = AppState.currentState;
    let online = false;

    const triggerSyncIfReady = async () => {
      if (!online) return;
      await backgroundRefresh();
    };

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const nextOnline = Boolean(state.isConnected) && state.isInternetReachable !== false;
      const justRecovered = !online && nextOnline;
      online = nextOnline;
      if (justRecovered) {
        void triggerSyncIfReady();
      }
    });

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      const movedToForeground = currentAppState.match(/inactive|background/) && nextState === "active";
      currentAppState = nextState;
      if (movedToForeground) {
        void triggerSyncIfReady();
      }
    });

    return () => {
      unsubscribeNetInfo();
      appStateSubscription.remove();
    };
  }, [backgroundRefresh]);

  const value = useMemo<NotesContextValue>(() => {
    return {
      notes,
      loading,
      refreshing,
      source,
      error,
      cacheInfo,
      refresh,
      toggleFavoriteById,
      resetCache
    };
  }, [notes, loading, refreshing, source, error, cacheInfo, refresh, toggleFavoriteById, resetCache]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used inside NotesProvider");
  }
  return context;
}
