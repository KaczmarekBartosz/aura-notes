# OpenClaw notes update guide

Ten dokument opisuje bezpieczny workflow aktualizacji notatek w tym repo.

## Co jest naprawione

- Indeksowanie nie uzywa juz whitelisty konkretnych plikow.
- Kazdy plik `.md` dodany do `memory/` albo `outputs/` jest automatycznie indeksowany.
- Wyjatki (celowe pomijanie):
  - sciezki zawierajace `/_archive/`
  - pliki z frontmatter `index: false`
- Notatki techniczne/systemowe sa klasyfikowane jako `category: system` i widoczne pod osobnym filtrem `System` w UI.
- Indeks jest generowany do `netlify/functions/data/notes-index.json` przez `npm run build:index`.
- Netlify deploy z `origin/main` uruchamia `npm run build`, a ten zawsze odpala `build:index` przed buildem Next.js.

## Standardowy workflow (OpenClaw)

1. Zsynchronizuj branch:

```bash
git checkout main
git pull --ff-only origin main
```

2. Dodaj lub zaktualizuj notatki `.md` tylko w:
   - `memory/`
   - `outputs/`

3. Zregeneruj indeks:

```bash
npm run build:index
```

4. Zweryfikuj, ze nowe pliki sa w indeksie:

```bash
node -e "const p=require('./netlify/functions/data/notes-index.json'); console.log(p.count); console.log(p.notes.slice(0,5).map(n=>n.path));"
```

5. Zweryfikuj build produkcyjny:

```bash
npm run build
```

6. Commit i push:

```bash
git add memory outputs netlify/functions/data/notes-index.json
git commit -m "docs(notes): sync markdown notes and regenerate index"
git push origin main
```

## Zasady bezpieczenstwa dla OpenClaw

- Nie usuwaj notatek bez wyraznej komendy.
- Nie edytuj kodu aplikacji przy zwyklym syncu notatek.
- Nie pomijaj `npm run build:index` po zmianach w `.md`.
- Jesli notatka ma byc ukryta, ustaw w jej frontmatter:

```md
---
index: false
---
```

- Jesli notatka ma byc jawnie traktowana jako systemowa, ustaw frontmatter:

```md
---
category: system
---
```

## Gotowy prompt do OpenClaw

Skopiuj i wklej calosc ponizej:

```text
Pracujesz w repo aura-notes. Twoj cel: zaktualizowac notatki markdown i bezpiecznie wypchnac je na origin/main tak, aby byly widoczne po deployu na Netlify.

Wymagania:
1) Najpierw wykonaj:
   - git checkout main
   - git pull --ff-only origin main
2) Edytuj/dodawaj tylko pliki .md w katalogach memory/ oraz outputs/.
3) Po zmianach zawsze uruchom npm run build:index.
4) Sprawdz, czy indeks istnieje i zawiera nowe notatki (netlify/functions/data/notes-index.json).
5) Uruchom npm run build i upewnij sie, ze build przechodzi.
6) Zacommituj TYLKO notatki i wygenerowany indeks.
7) Wypchnij na origin/main.
8) Na koncu podaj: liste zmienionych plikow, hash commita i krotkie potwierdzenie, ze notatki sa w indeksie.

Wazne guardrails:
- Nie usuwaj notatek bez wyraznego polecenia.
- Nie zmieniaj kodu aplikacji, jesli zadanie dotyczy tylko notatek.
- Nie pomijaj regeneracji indeksu.
```
