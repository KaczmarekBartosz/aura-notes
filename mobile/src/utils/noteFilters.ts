import type { Note, SortMode } from "../types/note";

export type NotesFilterState = {
  query: string;
  category: string | null;
  tag: string | null;
  sort: SortMode;
  onlyFavorites?: boolean;
};

export function sanitizeTag(tag: string): string | null {
  const normalized = tag.trim();
  return normalized.length > 0 ? normalized : null;
}

export function isVisibleNote(note: Note): boolean {
  return note.category !== "system" && note.category !== "other";
}

export function getAllTags(notes: Note[], category: string | null): string[] {
  const tagSet = new Set<string>();
  const visibleNotes = notes.filter(isVisibleNote);
  const source = category ? visibleNotes.filter((note) => note.category === category) : visibleNotes;

  source.forEach((note) => {
    note.tags
      .map(sanitizeTag)
      .filter((tag): tag is string => Boolean(tag))
      .forEach((tag) => tagSet.add(tag));
  });

  return [...tagSet].sort((a, b) => a.localeCompare(b, "pl"));
}

export function filterAndSortNotes(notes: Note[], state: NotesFilterState): Note[] {
  const q = state.query.trim().toLowerCase();

  const filtered = notes.filter((note) => {
    if (!isVisibleNote(note)) return false;
    if (state.onlyFavorites && !note.isFavorite) return false;
    if (state.category && note.category !== state.category) return false;
    const normalizedTags = note.tags.map(sanitizeTag).filter((tag): tag is string => Boolean(tag));
    if (state.tag && !normalizedTags.includes(state.tag)) return false;

    if (!q) return true;

    return (
      note.title.toLowerCase().includes(q) ||
      note.excerpt.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.category.toLowerCase().includes(q) ||
      normalizedTags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return filtered.sort((a, b) => {
    switch (state.sort) {
      case "updated_asc":
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case "title_asc":
        return a.title.localeCompare(b.title, "pl");
      case "created_desc":
        return new Date(b.createdAt ?? b.updatedAt).getTime() - new Date(a.createdAt ?? a.updatedAt).getTime();
      case "created_asc":
        return new Date(a.createdAt ?? a.updatedAt).getTime() - new Date(b.createdAt ?? b.updatedAt).getTime();
      case "updated_desc":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
}

export function getQuerySnippet(note: Note, query: string): string {
  const normalizedQuery = query.trim().toLowerCase();
  const fallback = note.excerpt || note.content.replace(/\s+/g, " ").trim().slice(0, 180);
  if (!normalizedQuery) {
    return fallback;
  }

  const haystack = note.content.replace(/\s+/g, " ").trim();
  const index = haystack.toLowerCase().indexOf(normalizedQuery);
  if (index === -1) {
    return fallback;
  }

  const start = Math.max(0, index - 80);
  const end = Math.min(haystack.length, index + normalizedQuery.length + 80);
  return `${start > 0 ? "..." : ""}${haystack.slice(start, end)}${end < haystack.length ? "..." : ""}`;
}
