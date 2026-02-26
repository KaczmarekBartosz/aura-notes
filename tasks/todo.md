# Fix: indeksowanie notatek Markdown (2026-02-26)

- [x] 1. Usunac whitelist/blacklist z indeksowania, aby kazdy `.md` z `memory/` i `outputs/` trafial do indeksu
- [x] 2. Uproscic logike dat (`updatedAt`/`createdAt`) tak, aby zmiany z commitow sync byly widoczne
- [x] 3. Przebudowac indeks i zweryfikowac, ze nowe notatki sa w `notes-index.json`
- [x] 4. Dodac dokumentacje workflow dla OpenClaw + gotowy prompt w pliku `.md` w katalogu glownym
- [x] 5. Zapisac wynik i wnioski w tym pliku (sekcja review)

## Review

- Zmieniono `scripts/build-index.mjs`: indeksuje domyslnie wszystkie `.md` z `memory/` i `outputs/`.
- Usunieto statyczna whitelist/blacklist notatek; pozostawiono tylko wykluczenie `/_archive/` i opcjonalne `index: false` w frontmatter.
- Poprawiono logike dat zeby sync commity aktualizowaly `updatedAt` (bez ignorowania commit message).
- Usunieto zaleznosc od `tail -n 1` (lepsza przenosnosc komend git).
- `npm run build:index` po zmianie: `count=87` (wczeniej `23`).
- Weryfikacja obecnosci: `memory/CODE_RECIPES_GLM.md`, `memory/X_BOOKMARKS_SYNC_REGISTRY.md`, `memory/recipes/aeo-ecommerce-7-layer-playbook-2026-02-25.md` sa w indeksie.
- Dodano dokumentacje: `OPENCLAW_NOTES_UPDATE_GUIDE.md`.
- Sprawdzenie techniczne: `npm run lint` i `npm run build` przechodza (pozostaje istniejacy warning `@next/next/no-img-element`).

---

# UX/UI/Design Optimization — Aura Notes (iPhone 12 Pro PWA)

## 🔴 TOP Priority
- [x] 1. Animowane przejścia lista ↔ czytnik (CSS slide transitions)
- [x] 2. Scroll-to-top przy wyborze nowej notatki
- [x] 6. Sticky header czytnika + reading progress bar

## 🟡 HIGH Priority
- [x] 3. Większe touch targets (gwiazda ★, chipy tagów)
- [x] 10. Debounce search + highlight snippets na liście
- [x] 8. Bottom nav z ikonami + count badge + indicator

## 🟢 NORMAL Priority
- [x] 9. Splash/transition po logowaniu (fade-out/in)
- [x] 12. Inline code styling + bloki kodu w markdown reader
- [x] 7. Pull-to-refresh na liście notatek

## 🔵 NICE to have
- [x] 5. Micro-animacje feedback (pulse/scale na akcjach)
- [x] 13. Kategoria notatki widoczna na liście
- [x] 4. Typograficzny empty state (zamiast obrazka)
- [x] 11. Keyboard shortcuts (Esc, ↑/↓, /)

---

## Zmiany w plikach

### Nowy: `lib/hooks.ts`
- `useDebounce<T>(value, delay)` — debounce dla search
- `useScrollProgress(ref)` — progress + scrollY z kontenera

### Zmodyfikowany: `app/globals.css`
- Inline code styling: `.markdown-body :not(pre) > code`
- Mobile chip touch targets: `@media (max-width: 768px) .chip`

### Przepisany: `app/page.tsx`
- Slide transitions (translateX + flex-nowrap)
- Scroll-to-top via useRef
- useScrollProgress dla sticky header + progress bar
- 44x44px touch targets na gwiazdkach ★
- useDebounce na search + highlightText/getSnippet helpers
- Bottom nav z ikonami (List/BookOpen) + count badge
- Unlock fade transition (opacity + scale)
- Pull-to-refresh (touch handlers + ★ spinner)
- Micro-animacje (active:scale-90, active:scale-[0.98])
- Category badge na liście notatek
- Typograficzny empty state z BookOpen icon
- Keyboard shortcuts (Esc/↑↓//)

## Weryfikacja
- [x] `npm run build` — sukces, brak błędów TS
- [x] `npm run lint` — brak nowych warningów

---

## Completed (Migration)
- [x] Scaffold Next.js + TypeScript app structure
- [x] Add Tailwind v4 pipeline + global tokens
- [x] Add shadcn-style UI primitives (Button/Input/Badge)
- [x] Port auth flow to Netlify function
- [x] Port notes list: search, tags, sorting, stats
- [x] Port reader: markdown, tables, mobile responsiveness
- [x] Add theme toggle with persistence
- [x] Keep existing index builder in build pipeline
- [x] Update Netlify config for Next.js plugin
- [x] Build verification and production push
