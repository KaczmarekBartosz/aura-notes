# GEMINI.md

## Project Overview
**Aura Notes** is a high-performance, private knowledge vault and Markdown reader. It is designed as a Progressive Web App (PWA) with a "Brutalist Matte E-Reader" aesthetic, focusing on speed, typography, and deep searchability across a collection of personal notes.

- **Architecture:** Single-Page Client Application (SPA) inside Next.js. The entire main UI resides in `app/page.tsx` for instantaneous transitions and an app-like feel.
- **Data Pipeline:** Markdown files in `memory/` and `outputs/` are scanned and indexed at build-time by `scripts/build-index.mjs` into `netlify/functions/data/notes-index.json`.
- **Backend:** Serverless logic handled by Netlify Functions (`netlify/functions/notes.js`).
- **Security:** Password-protected access via `x-aura-pass` header, using `NOTEBOOK_PASSWORD` environment variable.

## Tech Stack
- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`), custom design system with "glass" and "brutalist" modes.
- **UI Components:** Highly customized **shadcn/ui** primitives (zinc/New York style).
- **Icons:** Lucide React.
- **Markdown:** `react-markdown` with `remark-gfm`, `rehype-highlight`, and `rehype-sanitize`.
- **State/Hooks:** Custom hooks for debouncing, scroll progress, and mobile gestures in `lib/hooks.ts`.

## Building and Running

### Development
```bash
# Start Next.js dev server (default password: "local")
npm run dev
```

### Production Build
```bash
# Sequential build: Indexing MUST happen before Next.js build
npm run build:index && npm run build
```
*Note: The `npm run build` command is configured to run `build:index` automatically.*

### Testing
```bash
# Run theme and logic tests
npm run test
```

## Development Conventions

### 1. Design System: Brutalist & Glass
- **Brutalist:** `--radius: 0rem`, `border-4 border-foreground`, hard offset shadows (`shadow-[8px_8px_0_var(--foreground)]`).
- **Glass:** Utilizes `backdrop-filter` and `oklch()` colors for a modern translucent look.
- **Theming:** Manual theme management in `lib/theme.tsx`. Do not use standard `next-themes` providers as it conflicts with the custom manual implementation.

### 2. Note Organization
- **memory/**: Personal notes, logs, and "memory" files.
- **outputs/**: Finalized reports and processed information.
- **System Notes**: Files in specific paths (e.g., `memory/state/`) or with `category: system` frontmatter are automatically filtered from the main view and placed in a "System" category.

### 3. Build-Time Indexing
- The script `scripts/build-index.mjs` extracts titles from H1 headers, generates excerpts, and uses Git history to determine `createdAt` and `updatedAt` timestamps.
- It automatically categorizes notes based on content keywords (e.g., `fitness`, `ai-agents`, `marketing`).

### 4. PWA & Mobile Optimization
- Hand-written Service Worker in `public/sw.js`.
- Viewport handling uses `pt-safe`, `pb-safe` for notch/safe area compatibility.
- Interactive elements must maintain at least 44x44px touch targets.

## Key Files
- `app/page.tsx`: The heart of the application; contains the entire UI logic.
- `scripts/build-index.mjs`: The data processing engine.
- `lib/theme.tsx`: Theme state and persistence logic.
- `app/globals.css`: Core brutalist styles and animation definitions.
- `CLAUDE.md`: Highly detailed project-specific instructions and patterns (Review this for specific coding standards).
