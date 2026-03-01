# Aura-Notes Workflow

## Architektura Aplikacji

**Repozytorium:** `aura-notes/`
**GitHub:** https://github.com/KaczmarekBartosz/aura-notes

### Struktura

```
app/
├── page.tsx           # Główny interfejs (lista + czytnik)
├── api/notes/route.ts # API zwracające notes-index.json
├── layout.tsx         # Layout z PWA manifest
└── pwa-client-enhancements.tsx

netlify/functions/data/
└── notes-index.json   # Prebudowany indeks wszystkich notatek

memory/                # Sync z clawd/memory/
outputs/               # Sync z clawd/outputs/
```

### Mechanizm działania
1. Indeks (`notes-index.json`) — metadane wszystkich MD (tytuł, excerpt, tagi, daty, word count)
2. API wymaga nagłówka `x-aura-pass`
3. Frontend — PWA z trybem offline, wyszukiwarką, filtrowaniem po tagach

## Workflow Aktualizacji Notatek (OBOWIĄZKOWY)

```bash
# 1. Pobierz najnowszą wersję
git checkout main
git pull --ff-only origin main

# 2. Edytuj/dodaj pliki .md w memory/ i outputs/

# 3. ZREGENERUJ INDEKS (krytyczne!)
npm run build:index

# 4. Sprawdź indeks
ls -la netlify/functions/data/notes-index.json

# 5. Build
npm run build

# 6. Commit i push
git add .
git commit -m "docs: sync notes + regenerate index"
git push origin main
```

**Guardrails:**
- Nigdy nie pomijaj `npm run build:index` — nowe notatki nie będą widoczne bez indeksu
- Nie usuwaj notatek bez wyraźnego polecenia
- Nie zmieniaj kodu aplikacji przy aktualizacji treści
- Zawsze potwierdź hash commita i listę zmienionych plików

## Indeksowanie — Zasady (2026-02-26)

- Indeksowane: WSZYSTKIE `.md` z `memory/` i `outputs/`
- Wyjątki: `/_archive/` oraz `index: false` w frontmatter
- Kategoria "system": auto-wykrywane (`x-bookmarks-sync`, `state`, `token-usage`, `perplexity-searches`, `*_GLM.md`) + ręczne `category: system`
- Statystyki: 87 notatek (24 systemowe, 63 główne)

## Dla Bartka (iPhone)

1. Otwórz URL produkcyjny
2. Wpisz hasło (`NOTEBOOK_PASSWORD`)
3. Przeglądaj, wyszukuj, filtruj po tagach
