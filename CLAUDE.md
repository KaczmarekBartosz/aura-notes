# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aura Notes is a password-protected Markdown notes reader (personal "knowledge vault"). Notes stored in `memory/` and `outputs/` are indexed at build-time into a JSON payload served by a Netlify Function. No database — everything lives in the repo.

## Commands

```bash
npm run dev          # Next.js dev server (uses /api/notes endpoint, password: "local")
npm run build        # build:index + next build (index MUST run first)
npm run build:index  # Regenerate netlify/functions/data/notes-index.json from markdown files
npm run start        # Production server locally
npm run lint         # ESLint (next/core-web-vitals)
```

**Build order matters:** `build:index` generates `netlify/functions/data/notes-index.json` from markdown files. This file must exist before `next build` runs. The `build` script handles this automatically.

## Architecture

### Single-Page Client App

The entire UI is one `'use client'` component in `app/page.tsx`. No server components, no client-side routing — navigation between list and reader views is managed via React state (`selectedId`, `mobileTab`).

### Data Pipeline (Build-Time Indexing)

```
memory/*.md + outputs/*.md
    → scripts/build-index.mjs (scans, filters, extracts metadata via git log)
    → netlify/functions/data/notes-index.json (full content + metadata)
    → netlify/functions/notes.js (serves JSON, checks password)
```

Key functions in `build-index.mjs`:
- `isCuratedValueNote(rel)` — whitelist filter; only curated notes get indexed
- `shouldSkipFromIndex(rel)` — blacklist for noise files
- `classify(rel, content)` — categorizes notes (golden-protocols, daily-log, fitness-health, etc.)
- `detectTags(rel, content)` — auto-generates tags from content

### Authentication

- Password stored in `NOTEBOOK_PASSWORD` env var (Netlify)
- Client sends password in `x-aura-pass` header on every fetch
- **Dev:** `GET /api/notes` (Next.js route handler, password defaults to `"local"`)
- **Prod:** `GET /.netlify/functions/notes`
- Endpoint selection in `page.tsx` based on `process.env.NODE_ENV`

### Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NOTEBOOK_PASSWORD` | Netlify | Vault access password |
| `COMMIT_REF` | Netlify build | Git SHA shown as APP_VERSION in UI footer |

No `.env` file needed for local dev — the dev route uses hardcoded password `"local"`.

## Tech Stack

- **Next.js 15** (App Router), **React 19**, **TypeScript 5** (strict)
- **Tailwind CSS v4** via `@tailwindcss/postcss`
- **shadcn/ui** (New York style, zinc) — heavily customized for brutalist aesthetic
- **react-markdown** + rehype-highlight + rehype-sanitize + remark-gfm
- **Netlify** deployment with `@netlify/plugin-nextjs`
- **PWA** with hand-written Service Worker (`public/sw.js`)

No `src/` directory — files are at root level (`app/`, `lib/`, `components/`). Path alias `@/*` maps to project root.

## Design System — Brutalist Matte E-Reader

Core visual rules:
- `--radius: 0rem` — zero border-radius everywhere
- `border-4 border-foreground` — thick borders
- `shadow-[8px_8px_0_var(--foreground)]` — hard offset neo-brutalist shadows
- Hover pattern: `hover:-translate-y-1 hover:-translate-x-1` + shadow growth
- Typography: `font-black uppercase tracking-tight`
- Colors use `oklch()` color space

Custom CSS classes in `globals.css`: `.chip`/`.chip-active` (tag filters), `.note-btn`/`.note-btn-active` (note list items), `.markdown-body` (reader), `.vignette-grain` (e-ink texture overlay), `.animate-ink-spill` (shake easter egg).

Theme toggle is manual (`document.documentElement.classList.toggle('dark')` + `localStorage` key `aura-theme`). Does **not** use `next-themes`.

## Key Conventions

- shadcn components in `components/ui/` are **heavily modified** — don't blindly sync with upstream shadcn templates
- Theming via manual classList + localStorage, not next-themes
- `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge)
- iOS PWA: viewport `cover`, safe-area insets via `.pt-safe`/`.pb-safe`/`.px-safe`, gesture/zoom blocking
- Service Worker registered by `PwaClientEnhancements` component in layout
- Netlify Functions are CommonJS (`notes.js`, `auth.js`)

## Adding Notes

Add `.md` files to `memory/` or `outputs/`, then rebuild. Notes are only indexed if they pass the `isCuratedValueNote()` whitelist in `scripts/build-index.mjs`.

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
