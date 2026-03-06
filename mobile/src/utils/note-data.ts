import type { Note } from "../types/note";

function sanitizeString(value: unknown, fallback = "") {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}

function sanitizeTimestamp(value: unknown, fallback: string) {
  const candidate = sanitizeString(value);
  if (!candidate) return fallback;
  const parsed = Date.parse(candidate);
  return Number.isNaN(parsed) ? fallback : new Date(parsed).toISOString();
}

function sanitizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => sanitizeString(tag))
    .filter(Boolean)
    .filter((tag, index, source) => source.indexOf(tag) === index);
}

function countWords(source: string) {
  const normalized = source.replace(/[`*_>#\-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return 0;
  return normalized.split(" ").length;
}

export function buildExcerpt(source: string, fallback = "", limit = 180) {
  const normalizedSource = source.replace(/\s+/g, " ").trim();
  const normalizedFallback = fallback.replace(/\s+/g, " ").trim();
  const base = normalizedFallback || normalizedSource;
  if (!base) return "Brak podglądu notatki.";
  if (base.length <= limit) return base;
  return `${base.slice(0, limit).trimEnd()}...`;
}

function estimateReadingMinutes(words: number) {
  return Math.max(1, Math.ceil(words / 220));
}

function sanitizeNumber(value: unknown, fallback: number) {
  const next = typeof value === "number" ? value : Number(value);
  return Number.isFinite(next) && next >= 0 ? next : fallback;
}

export function normalizeNotePayload(raw: unknown): Note | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;
  const id = sanitizeString(payload.id);
  const title = sanitizeString(payload.title);
  if (!id || !title) return null;

  const now = new Date().toISOString();
  const content = typeof payload.content === "string" ? payload.content : "";
  const excerpt = buildExcerpt(content, sanitizeString(payload.excerpt));
  const words = sanitizeNumber(payload.words, countWords(content || excerpt || title));
  const readingMinutes = sanitizeNumber(payload.readingMinutes, estimateReadingMinutes(words));

  return {
    id,
    path: sanitizeString(payload.path),
    folder: sanitizeString(payload.folder, "vault"),
    category: sanitizeString(payload.category, "other"),
    title,
    excerpt,
    createdAt: payload.createdAt ? sanitizeTimestamp(payload.createdAt, now) : undefined,
    updatedAt: sanitizeTimestamp(payload.updatedAt, now),
    readingMinutes,
    words,
    tags: sanitizeTags(payload.tags),
    content,
    isFavorite: Boolean(payload.isFavorite)
  };
}

export function buildNotesSignature(notes: Note[]) {
  return notes
    .map((note) => `${note.id}:${note.category}:${note.updatedAt}:${note.title}:${note.excerpt}:${note.words}:${note.readingMinutes}:${note.isFavorite ? 1 : 0}`)
    .join("|");
}
