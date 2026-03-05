import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { AppState, type AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import type { Note } from "../types/note";
import { bootstrapNotes, clearLocalCache, readCacheInfo, syncNotes, toggleFavorite } from "../services/notesRepository";

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
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<"api" | "cache" | "bundled" | "seed" | "boot">("boot");
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ count: number; lastSyncedAt: string | null }>({
    count: 0,
    lastSyncedAt: null
  });

  const reloadCacheInfo = useCallback(async () => {
    const next = await readCacheInfo();
    if (isMountedRef.current) {
      setCacheInfo(next);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;
    setRefreshing(true);
    setError(null);
    try {
      const result = await syncNotes();
      if (!isMountedRef.current) return;
      setNotes(result.notes);
      setSource(result.source);
      await reloadCacheInfo();
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Nie udało się odświeżyć notatek.");
      }
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [reloadCacheInfo]);

  const toggleFavoriteById = useCallback(async (noteId: string) => {
    setNotes((current) =>
      current.map((note) => (note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note))
    );

    try {
      const nextNotes = await toggleFavorite(noteId);
      setNotes(nextNotes);
      await reloadCacheInfo();
    } catch {
      setNotes((current) =>
        current.map((note) => (note.id === noteId ? { ...note, isFavorite: !note.isFavorite } : note))
      );
    }
  }, [reloadCacheInfo]);

  const resetCache = useCallback(async () => {
    await clearLocalCache();
    const initial = await bootstrapNotes();
    setNotes(initial.notes);
    setSource(initial.source);
    await reloadCacheInfo();
  }, [reloadCacheInfo]);

  const refreshSafely = useCallback(async () => {
    if (refreshing) return;
    await refresh();
  }, [refresh, refreshing]);

  useEffect(() => {
    isMountedRef.current = true;
    let mounted = true;
    (async () => {
      try {
        const initial = await bootstrapNotes();
        if (!mounted) return;
        setNotes(initial.notes);
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
      await refresh();
    })();

    return () => {
      mounted = false;
      isMountedRef.current = false;
    };
  }, [refresh, reloadCacheInfo]);

  useEffect(() => {
    let currentAppState: AppStateStatus = AppState.currentState;
    let online = false;

    const triggerSyncIfReady = async () => {
      if (!online) return;
      await refreshSafely();
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
  }, [refreshSafely]);

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
