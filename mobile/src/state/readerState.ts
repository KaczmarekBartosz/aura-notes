import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_NOTE_KEY = "aura-notes.reader.last-note-id";
const NOTE_SCROLL_PREFIX = "aura-notes.reader.scroll.";
const READER_FONT_SCALE_KEY = "aura-notes.reader.font-scale";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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

export async function saveReaderFontScale(scale: number) {
  try {
    await AsyncStorage.setItem(READER_FONT_SCALE_KEY, String(clamp(scale, 0.92, 1.28)));
  } catch {
    // Best-effort.
  }
}

export async function readReaderFontScale(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(READER_FONT_SCALE_KEY);
    if (!value) return 1;
    return clamp(Number(value) || 1, 0.92, 1.28);
  } catch {
    return 1;
  }
}
