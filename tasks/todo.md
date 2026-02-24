# Migration plan — aura-notes (HTML/JS → Next.js/TS)

1. [x] Scaffold Next.js + TypeScript app structure
2. [x] Add Tailwind v4 pipeline + global tokens
3. [x] Add shadcn-style UI primitives (Button/Input/Badge)
4. [x] Port auth flow to Netlify function `/.netlify/functions/notes`
5. [x] Port notes list: search, tags, sorting, stats
6. [x] Port reader: markdown, tables, mobile responsiveness, back navigation
7. [x] Add theme toggle (light/dark) with persistence
8. [x] Keep existing index builder (`scripts/build-index.mjs`) in build pipeline
9. [x] Update Netlify config for Next.js plugin
10. [x] Build verification and production push (`main` + `master`)

## Notes
- Legacy `public/index.html` archived to `public/_archive/index.legacy.html`.
- App now runs from `app/page.tsx` (Next App Router).
