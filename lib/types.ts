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
  isHeavy?: boolean;
  isArchived?: boolean;
  content: string;
  isFavorite?: boolean;
  plainText?: string;
};

export type NotesPayload = {
  generatedAt: string;
  latestUpdatedAt: string | null;
  count: number;
  notes: Note[];
};
