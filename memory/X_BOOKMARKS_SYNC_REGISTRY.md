# Zakładki X — Rejestr Synchronizacji

*Plik nadzorczy dla ręcznej synchronizacji zakładek X z bazą wiedzy*

---

## Ostatnia synchronizacja

| Data | Ilość zakładek | Nowych | Przetworzonych | Status | Wykonane przez |
|------|---------------|--------|----------------|--------|----------------|
| 2026-02-25 | 212 | 212 | 212 | ✅ Zakończona | Aura (subagent) |
| 2026-02-18 | 0 | 0 | 0 | ⚠️ Brak nowych | Aura |

---

## Historia synchronizacji (szczegóły)

### 2026-02-25 — Pełna synchronizacja (7 dni zaległości)
**Zakres:** Pełna aktualizacja po przerwie  
**ID nieprzetworzonych:** 212 zakładek (lista w `/tmp/unprocessed_ids.txt`)  
**Wykonane akcje:**
- [x] Pobranie treści zakładek przez `bird`
- [x] Analiza i kategoryzacja treści
- [x] Aktualizacja `memory/x-bookmarks.md`
- [x] Aktualizacja `memory/KNOWLEDGE_ACTIONABLE.md`
- [x] Aktualizacja `memory/CODE_RECIPES_GLM.md`
- [x] Aktualizacja protokołów GOLD_*
- [x] Aktualizacja `KSIEGA_PEPTYDOW.md`
- [x] Utworzenie nowych plików w `memory/recipes/`
- [x] Aktualizacja `memory/state/bookmarks-processed.json`
- [x] Commit zmian na git

**Statystyka:**
- Przetworzono: 212 zakładek
- Nowe wpisy w KNOWLEDGE_ACTIONABLE: TBD
- Nowe pliki recipes: TBD
- Zaktualizowane pliki GOLD_*: TBD

---

## Procedura ręcznej synchronizacji

Gdy Bartek poprosi o synchronizację:

1. **Sprawdź ostatnią synchronizację** (ten plik, sekcja "Ostatnia synchronizacja")
2. **Pobierz listę zakładek:** `tools/birdx bookmarks -n 300 --plain`
3. **Porównaj z przetworzonymi:**
   ```bash
   comm -23 current_ids.txt processed_ids.txt > unprocessed_ids.txt
   ```
4. **Jeśli są nieprzetworzone:** Uruchom subagenta do kompleksowego przetworzenia
5. **Zaktualizuj ten plik** (dodaj nowy wpis w historii)
6. **Git commit** z opisem synchronizacji

---

## Pliki zależne (do aktualizacji przy każdej synchronizacji)

| Plik | Cel | Priorytet |
|------|-----|-----------|
| `memory/x-bookmarks.md` | Główna kolekcja zakładek | 🔴 Krytyczny |
| `memory/KNOWLEDGE_ACTIONABLE.md` | Actionable insights | 🔴 Krytyczny |
| `memory/state/bookmarks-processed.json` | Lista przetworzonych ID | 🔴 Krytyczny |
| `memory/CODE_RECIPES_GLM.md` | Kod/przepisy techniczne | 🟡 Wysoki |
| `memory/GOLD_GROWTH_MARKETING_PROTOCOL.md` | Protokoły growth/marketing | 🟡 Wysoki |
| `memory/GOLD_FITNESS_PROTOCOL.md` | Protokoły fitness/health | 🟡 Wysoki |
| `memory/GOLD_DESIGN_PROTOCOL.md` | Protokoły design/UI | 🟡 Wysoki |
| `memory/KSIEGA_PEPTYDOW.md` | Baza peptydów | 🟡 Wysoki |
| `memory/recipes/*.md` | Długie analizy | 🟢 Średni |

---

## Status bieżący

- **Oczekuje na:** Zakończenie subagenta (runId: `41a8292d-ea54-4011-aa56-2a0e1b6d6f28`)
- **Następna synchronizacja:** Na żądanie Bartka
- **Zaległości:** Brak (po zakończeniu bieżącej synchronizacji)

---

## Log zmian w tym pliku

| Data | Zmiana | Autor |
|------|--------|-------|
| 2026-02-25 | Utworzenie pliku rejestru | Aura |
| 2026-02-25 | Inicjalizacja pierwszej synchronizacji | Aura |

