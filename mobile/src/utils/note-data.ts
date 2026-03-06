import type { Note } from "../types/note";

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function stripFrontmatter(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
}

function stripMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\|/g, " ")
    .replace(/---+/g, " ");
}

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
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => sanitizeString(tag))
      .filter(Boolean)
      .filter((tag, index, source) => source.indexOf(tag) === index);
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => sanitizeString(tag))
    .filter(Boolean)
    .filter((tag, index, source) => source.indexOf(tag) === index);
}

export function countWords(source: string) {
  const normalized = stripMarkdown(stripFrontmatter(source)).replace(/\s+/g, " ").trim();
  if (!normalized) return 0;
  return normalized.split(" ").length;
}

export function buildExcerpt(source: string, fallback = "", limit = 180) {
  const normalizedSource = stripMarkdown(stripFrontmatter(source)).replace(/\s+/g, " ").trim();
  const normalizedFallback = stripMarkdown(fallback).replace(/\s+/g, " ").trim();
  const shouldPreferSource = /^(title|category|tags|created|updated|excerpt)\s*:/i.test(normalizedFallback);
  const base = shouldPreferSource ? normalizedSource : normalizedFallback || normalizedSource;
  if (!base) return "Brak podglądu notatki.";
  if (base.length <= limit) return base;
  return `${base.slice(0, limit).trimEnd()}...`;
}

export function estimateReadingMinutes(words: number) {
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
    isFavorite: Boolean(payload.isFavorite),
    fileName: sanitizeString(payload.fileName, extractFileName(sanitizeString(payload.path)) || `${id}.md`),
    localUri: sanitizeString(payload.localUri),
    checksum: sanitizeString(payload.checksum),
    importedAt: sanitizeString(payload.importedAt),
    source: sanitizeSource(payload.source)
  };
}

export function buildNotesSignature(notes: Note[]) {
  return notes
    .map(
      (note) =>
        `${note.id}:${note.category}:${note.updatedAt}:${note.title}:${note.excerpt}:${note.words}:${note.readingMinutes}:${note.isFavorite ? 1 : 0}:${note.checksum ?? ""}:${note.localUri ?? ""}`
    )
    .join("|");
}

function sanitizeSource(value: unknown): Note["source"] | undefined {
  return value === "imported" || value === "bundled" || value === "seed" || value === "api" ? value : undefined;
}

function readFrontmatterBlock(source: string) {
  return source.match(FRONTMATTER_PATTERN)?.[1] ?? "";
}

function parseFrontmatterList(rawFrontmatter: string, key: string): string[] {
  const inline = rawFrontmatter.match(new RegExp(`^\\s*${key}\\s*:\\s*\\[(.*?)\\]\\s*$`, "im"))?.[1];
  if (inline) {
    return inline
      .split(",")
      .map((item) => item.replace(/^['"\s]+|['"\s]+$/g, "").trim())
      .filter(Boolean);
  }

  const lines = rawFrontmatter.split(/\r?\n/);
  const values: string[] = [];
  let collecting = false;

  for (const line of lines) {
    if (!collecting) {
      if (new RegExp(`^\\s*${key}\\s*:\\s*$`, "i").test(line)) {
        collecting = true;
      }
      continue;
    }

    const listItem = line.match(/^\s*-\s*(.*?)\s*$/)?.[1];
    if (listItem) {
      values.push(listItem.replace(/^['"]|['"]$/g, "").trim());
      continue;
    }

    if (!line.trim()) continue;
    break;
  }

  return values.filter(Boolean);
}

function parseFrontmatterMap(source: string) {
  const raw = readFrontmatterBlock(source);
  const map: Record<string, string> = {};
  if (!raw) return { map, tags: [] as string[] };

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([a-zA-Z0-9_-]+)\s*:\s*(.*?)\s*$/);
    if (!match) continue;
    map[match[1].toLowerCase()] = match[2].replace(/^['"]|['"]$/g, "").trim();
  }

  return {
    map,
    tags: parseFrontmatterList(raw, "tags")
  };
}

function titleFromMarkdown(source: string, fallback: string) {
  const frontmatter = parseFrontmatterMap(source).map;
  if (frontmatter.title) return frontmatter.title;

  const match = stripFrontmatter(source).match(/^#\s+(.+)$/m);
  if (match?.[1]) return match[1].trim();

  return fallback;
}

export function extractFileName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.split(/[\\/]/).filter(Boolean).pop() ?? "";
}

export function normalizeImportFileName(value: string) {
  const fileName = extractFileName(value).replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").trim();
  if (!fileName) return "";
  return /\.md$/i.test(fileName) ? fileName : `${fileName}.md`;
}

export function buildImportedNoteId(fileName: string) {
  return `import:${normalizeImportFileName(fileName).toLowerCase()}`;
}

export function buildContentChecksum(source: string) {
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getFileStem(fileName: string) {
  return normalizeImportFileName(fileName).replace(/\.md$/i, "");
}

export function resolveNoteFileName(note: Note) {
  return normalizeImportFileName(note.fileName ?? extractFileName(note.path) ?? note.id);
}

type ParseImportedMarkdownOptions = {
  fileName: string;
  content: string;
  existingNote?: Note | null;
  localUri?: string;
  importedAt?: string;
  lastModified?: string;
  preserveId?: boolean;
};

export function parseImportedMarkdown({
  fileName,
  content,
  existingNote,
  localUri,
  importedAt,
  lastModified,
  preserveId = false
}: ParseImportedMarkdownOptions): Note | null {
  const normalizedContent = typeof content === "string" ? content.replace(/\uFEFF/g, "").trim() : "";
  if (!normalizedContent) return null;

  const normalizedFileName = normalizeImportFileName(fileName);
  if (!normalizedFileName) return null;

  const { map, tags } = parseFrontmatterMap(normalizedContent);
  const fallbackTitle = getFileStem(normalizedFileName).replace(/[-_]+/g, " ").trim() || normalizedFileName;
  const now = new Date().toISOString();
  const checksum = buildContentChecksum(normalizedContent);
  const fallbackTimestamp = lastModified || existingNote?.updatedAt || now;
  const createdAt = sanitizeTimestamp(map.created_at ?? map.created ?? map.date, existingNote?.createdAt ?? fallbackTimestamp);
  const updatedAt = sanitizeTimestamp(map.updated_at ?? map.updated ?? map.modified, fallbackTimestamp);
  const resolvedTags = tags.length > 0 ? sanitizeTags(tags) : existingNote?.tags ?? [];
  const resolvedCategory = sanitizeString(map.category, existingNote?.category ?? "knowledge");
  const resolvedPath = sanitizeString(existingNote?.path, `imports/${normalizedFileName}`);
  const finalImportedAt = importedAt ?? now;

  const note: Note = {
    id: preserveId && existingNote?.id ? existingNote.id : existingNote?.id ?? buildImportedNoteId(normalizedFileName),
    path: resolvedPath,
    folder: sanitizeString(existingNote?.folder, "imports"),
    category: resolvedCategory,
    title: sanitizeString(titleFromMarkdown(normalizedContent, fallbackTitle), fallbackTitle),
    excerpt: buildExcerpt(normalizedContent, sanitizeString(map.excerpt)),
    createdAt,
    updatedAt,
    readingMinutes: estimateReadingMinutes(countWords(normalizedContent)),
    words: countWords(normalizedContent),
    tags: resolvedTags,
    content: normalizedContent,
    isFavorite: existingNote?.isFavorite ?? false,
    fileName: normalizedFileName,
    localUri: sanitizeString(localUri, existingNote?.localUri ?? ""),
    checksum,
    importedAt: finalImportedAt,
    source: "imported"
  };

  return note;
}
