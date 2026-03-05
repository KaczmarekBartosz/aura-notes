import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_NOTE_KEY = "aura-notes.reader.last-note-id";
const NOTE_SCROLL_PREFIX = "aura-notes.reader.scroll.";

export async function saveLastOpenedNoteId(noteId: string) {
  try {
    await AsyncStorage.setItem(LAST_NOTE_KEY, noteId);
  } catch {
    // Best-effort.
  }
}

export async function readLastOpenedNoteId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_NOTE_KEY);
  } catch {
    return null;
  }
}

export async function saveReaderScroll(noteId: string, scrollY: number) {
  try {
    await AsyncStorage.setItem(`${NOTE_SCROLL_PREFIX}${noteId}`, String(Math.max(0, Math.round(scrollY))));
  } catch {
    // Best-effort.
  }
}

export async function readReaderScroll(noteId: string): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(`${NOTE_SCROLL_PREFIX}${noteId}`);
    return value ? Number(value) || 0 : 0;
  } catch {
    return 0;
  }
}

