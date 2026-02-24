# aura-notes — cleanup + redesign (bez półśrodków)

## Plan
- [x] Przejrzeć nagłówki + pierwsze linie wszystkich notatek (`memory/` + `outputs/`)
- [x] Zdefiniować twardą politykę: tylko notatki o realnej wartości w indeksie appki
- [x] Wyciąć systemowe/logowe/sync-token notatki z indeksu
- [x] Zachować kluczowe notatki fitness (w tym plan SUPER-HERO + WHOOP)
- [x] Naprawić sortowanie pod dwie osie: data utworzenia i data aktualizacji
- [x] Dodać czytelny kontekst dat w UI (utw. / akt.)
- [x] Przebudować styl na spójny, top-tier monochrome glass (bez żółci i przypadkowych kolorów)
- [x] Build + push na `main` i `master`

## Review
- Indeks został przełączony na curated-value mode: tylko wybrane, wartościowe notatki.
- Systemowe logi/sync/tokens/perplexity i dzienne śmieci są poza appką.
- Sortowanie ma teraz 5 trybów: aktualizacja↓/↑, utworzenie↓/↑, A-Z.
- UI metadanych pokazuje jednocześnie datę utworzenia i aktualizacji.
- Design został odkolorowany i ujednolicony do neutralnego monochrome glass.
