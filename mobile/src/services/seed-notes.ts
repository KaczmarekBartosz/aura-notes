import type { Note } from "../types/note";

const now = new Date().toISOString();

export const SEED_NOTES: Note[] = [
  {
    id: "seed-fitness-001",
    path: "memory/fitness/weekly-protocol.md",
    folder: "memory",
    category: "fitness-health",
    title: "Weekly Fitness Protocol",
    excerpt: "Plan tygodnia: siła, cardio i regeneracja.",
    createdAt: now,
    updatedAt: now,
    readingMinutes: 4,
    words: 460,
    tags: ["fitness", "protocol", "weekly"],
    content: `# Weekly Fitness Protocol

## Cel
- 4 treningi siłowe
- 2 sesje cardio
- 1 dzień pełnej regeneracji

## Notatka
Najważniejsza jest regularność i progres objętości.

\`\`\`ts
const sessionsPerWeek = 6;
const restDay = "Sunday";
console.log({ sessionsPerWeek, restDay });
\`\`\``
  },
  {
    id: "seed-ai-001",
    path: "memory/ai/agent-patterns.md",
    folder: "memory",
    category: "ai-agents",
    title: "AI Agent Patterns",
    excerpt: "Checklista dla multi-agent workflow i observability.",
    createdAt: now,
    updatedAt: now,
    readingMinutes: 5,
    words: 590,
    tags: ["ai", "agents", "architecture"],
    content: `# AI Agent Patterns

## Warstwy
1. Planner
2. Executor
3. Critic

## Rule
Każdy etap powinien mieć output schema i retry policy.`
  },
  {
    id: "seed-design-001",
    path: "memory/design/mobile-rules.md",
    folder: "memory",
    category: "design",
    title: "Mobile UI Rules",
    excerpt: "Spacing, contrast, animation budget i touch targets.",
    createdAt: now,
    updatedAt: now,
    readingMinutes: 3,
    words: 320,
    tags: ["design", "ui", "mobile"],
    content: `# Mobile UI Rules

## Essentials
- Minimum touch target: 44x44
- Motion only when it helps orientation
- Keep hierarchy obvious`
  },
  {
    id: "seed-recipe-001",
    path: "memory/recipes/high-protein-bowl.md",
    folder: "memory",
    category: "recipes",
    title: "High Protein Bowl",
    excerpt: "Szybki przepis: 45g białka, 12 min przygotowania.",
    createdAt: now,
    updatedAt: now,
    readingMinutes: 2,
    words: 220,
    tags: ["recipes", "nutrition", "protein"],
    content: `# High Protein Bowl

- 180g kurczaka
- 150g ryżu
- 80g warzyw

**Makro:** 45P / 60C / 12F`
  },
  {
    id: "seed-marketing-001",
    path: "memory/growth/content-loop.md",
    folder: "memory",
    category: "growth-marketing",
    title: "Content Loop Framework",
    excerpt: "Jak zamieniać notatki w mikro-content i długie formy.",
    createdAt: now,
    updatedAt: now,
    readingMinutes: 4,
    words: 510,
    tags: ["growth", "content", "system"],
    content: `# Content Loop

1. Capture
2. Distill
3. Publish
4. Recycle`
  },
  {
    id: "seed-daily-001",
    path: "memory/daily/2026-03-04.md",
    folder: "memory",
    category: "daily-log",
    title: "Daily Log - 2026-03-04",
    excerpt: "Priorytety dnia i krótkie podsumowanie.",
    createdAt: now,
    updatedAt: now,
    readingMinutes: 1,
    words: 150,
    tags: ["daily", "journal"],
    content: `# Daily Log

## Top 3
- Ship Expo prototype
- Review sync layer
- 45 min deep work`
  }
];

