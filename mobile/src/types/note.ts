export type Note = {
  id: string;
  path: string;
  folder: string;
  category: string;
  title: string;
  excerpt: string;
  createdAt?: string;
  updatedAt: string;
  readingMinutes: number;
  words: number;
  tags: string[];
  content: string;
  isFavorite?: boolean;
  fileName?: string;
  localUri?: string;
  checksum?: string;
  importedAt?: string;
  source?: "imported" | "bundled" | "seed" | "api";
};

export type NotesPayload = {
  notes: Note[];
  generatedAt: string;
  latestUpdatedAt?: string | null;
};

export type SortMode = "updated_desc" | "updated_asc" | "title_asc" | "created_desc" | "created_asc";

export type ImportNotesResult = {
  imported: number;
  updated: number;
  skipped: number;
  failed: string[];
  totalSelected: number;
};
