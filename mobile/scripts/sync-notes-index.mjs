import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(process.cwd(), "..");
const sourcePath = path.join(projectRoot, "netlify", "functions", "data", "notes-index.json");
const targetPath = path.join(process.cwd(), "assets", "notes-index.json");

function readSource() {
  const raw = fs.readFileSync(sourcePath, "utf-8");
  return JSON.parse(raw);
}

function normalizeNote(note) {
  return {
    id: String(note?.id ?? ""),
    path: String(note?.path ?? ""),
    folder: String(note?.folder ?? ""),
    category: String(note?.category ?? "other"),
    title: String(note?.title ?? ""),
    excerpt: String(note?.excerpt ?? ""),
    createdAt: note?.createdAt ? String(note.createdAt) : undefined,
    updatedAt: String(note?.updatedAt ?? new Date().toISOString()),
    readingMinutes: Number(note?.readingMinutes ?? 1),
    words: Number(note?.words ?? 0),
    tags: Array.isArray(note?.tags) ? note.tags.map((tag) => String(tag)) : [],
    content: String(note?.content ?? ""),
    isFavorite: false
  };
}

function main() {
  const source = readSource();
  const sourceNotes = Array.isArray(source?.notes) ? source.notes : [];
  const notes = sourceNotes.map(normalizeNote).filter((note) => note.id.length > 0);

  const payload = {
    generatedAt: String(source?.generatedAt ?? new Date().toISOString()),
    latestUpdatedAt: source?.latestUpdatedAt ?? null,
    count: notes.length,
    notes
  };

  fs.writeFileSync(targetPath, JSON.stringify(payload), "utf-8");
  console.log(`Synced ${notes.length} notes to ${targetPath}`);
}

main();

