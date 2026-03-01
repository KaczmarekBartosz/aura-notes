# Frontmatter Guide - Dokumentacja Systemu

## Co to jest Frontmatter?

Frontmatter to metadane umieszczane na **początku pliku Markdown** w formacie YAML, otoczone potrójnymi myślnikami (`---`). System frontmatter pozwala na:

- **Kategoryzację** notatek bez polegania na strukturze folderów
- **Szybkie wyszukiwanie** po tagach, typach i kategoriach
- **Automatyzację** przetwarzania notatek przez skrypty
- **Standaryzację** metadanych w całym systemie

## Dlaczego Frontmatter jest Ważny?

1. **Niezależność od struktury folderów** - Kategorie są przechowywane w metadanych, nie w nazwach folderów
2. **Wyszukiwanie** - Możliwość filtrowania po tagach, datach, źródłach
3. **Integracja z narzędziami** - Obsidian, Static Site Generators, skrypty automatyzujące
4. **Spójność** - Wszystkie notatki mają ten sam format metadanych

---

## Lista Wszystkich Pól

| Pole | Wymagane | Opis | Przykład |
|------|----------|------|----------|
| `title` | Tak | Tytuł notatki | `"Gold Fitness Protocol"` |
| `category` | Tak | Główna kategoria | `"fitness-health"` |
| `subcategory` | Nie | Podkategoria | `"peptides"` |
| `tags` | Tak | Lista tagów | `["health", "fitness"]` |
| `type` | Tak | Typ notatki | `"protocol"` |
| `created` | Tak | Data utworzenia | `"2026-02-25"` |
| `updated` | Tak | Data modyfikacji | `"2026-02-27"` |
| `source` | Tak | Źródło treści | `"x-bookmark"` |
| `ai_generated` | Tak | Czy AI generowała | `false` |

### Szczegółowy Opis Pól

#### `title`
- Pełny tytuł notatki
- Powinien być zrozumiały i opisowy
- Może być inny niż nazwa pliku

#### `category`
- Jedna z predefiniowanych kategorii (patrz sekcja niżej)
- Definiuje główną dziedzinę treści

#### `subcategory`
- Opcjonalna specjalizacja w obrębie kategorii
- Pozwala na dokładniejsze grupowanie

#### `tags`
- 3-7 tagów opisujących treść
- Użyj małych liter, bez spacji (używaj myślników)
- Tagi powinny być specyficzne ale nie zbyt wąskie

#### `type`
- Określa format/przeznaczenie notatki
- Jedna z predefiniowanych wartości

#### `created` / `updated`
- Format: `YYYY-MM-DD`
- `updated` zmienia się przy każdej modyfikacji

#### `source`
- Określa skąd pochodzi treść
- Ważne dla śledzenia pochodzenia informacji

#### `ai_generated`
- `true` jeśli treść była generowana przez AI
- `false` jeśli pisana ręcznie lub kopiowana ze źródła

---

## Dostępne Kategorie

| Kategoria | Opis | Przykłady Subkategorii |
|-----------|------|----------------------|
| `fitness-health` | Trening, zdrowie, suplementacja | `peptides`, `training`, `nutrition`, `psychology` |
| `golden-protocols` | GOLD_* protokoły i systemy | `productivity`, `protocols` |
| `ai-agents` | OpenClaw, AI, automatyzacja | `automation`, `development`, `workflows`, `research` |
| `bookmarks` | Zakładki z X/Twitter | `x-twitter`, `resources` |
| `design` | UI/UX, grafika | `ui-ux`, `inspiration` |
| `daily-log` | Logi dzienne i sesje | - |
| `growth-marketing` | Marketing, SEO, growth | `seo`, `content`, `indie-hacker` |
| `outputs` | Wyjściowe pliki, wyniki | `reports`, `exports` |
| `recipes` | Przepisy kodu | `code`, `snippets` |
| `taste` | Kulinarne, osobiste preferencje | `personal` |

---

## Dostępne Typy

| Typ | Opis | Kiedy Używać |
|-----|------|--------------|
| `protocol` | Protokoły, systemy, procedury | GOLD_* pliki, PROJEKT_*, procedury |
| `research` | Badania, analizy, research | RESEARCH_*, KNOWLEDGE_*, analizy |
| `daily-log` | Codzienne zapiski | Pliki z datami w nazwie (2026-02-25.md) |
| `bookmark` | Zakładki z linkami | x-bookmarks, kolekcje linków |
| `note` | Ogólne notatki | Pozostałe notatki |

---

## Dostępne Źródła

| Źródło | Opis | Przykład Użycia |
|--------|------|-----------------|
| `x-bookmark` | Treść z X/Twitter | Zakładki z X |
| `perplexity` | Wyniki wyszukiwania Perplexity | Research z Perplexity |
| `manual` | Napisane ręcznie | Własne notatki |
| `claude` | Wygenerowane przez AI | Treści generowane przez Claude/AI |

---

## Przykłady Poprawnie Wypełnionego Frontmatter

### Przykład 1: Protokół Fitness
```yaml
---
title: "Gold Fitness Protocol"
category: "fitness-health"
subcategory: "protocols"
tags: ["health", "fitness", "training", "protocol"]
type: "protocol"
created: "2026-02-01"
updated: "2026-02-27"
source: "x-bookmark"
ai_generated: false
---
```

### Przykład 2: Research o Peptydach
```yaml
---
title: "Research: Peptydy BPC-157, CJC, TB500"
category: "fitness-health"
subcategory: "peptides"
tags: ["peptides", "research", "biohacking", "health"]
type: "research"
created: "2026-02-15"
updated: "2026-02-15"
source: "manual"
ai_generated: false
---
```

### Przykład 3: Daily Log
```yaml
---
title: "2026-02-25 — Daily Session Log"
category: "daily-log"
tags: ["daily-log", "session", "tasks"]
type: "daily-log"
created: "2026-02-25"
updated: "2026-02-25"
source: "manual"
ai_generated: false
---
```

### Przykład 4: Zakładki z X
```yaml
---
title: "X Bookmarks - Kolekcja Zakładek"
category: "bookmarks"
subcategory: "x-twitter"
tags: ["bookmarks", "x-twitter", "resources", "fitness", "ai"]
type: "bookmark"
created: "2026-02-17"
updated: "2026-02-27"
source: "x-bookmark"
ai_generated: false
---
```

### Przykład 5: Notatka o AI
```yaml
---
title: "OpenClaw Automation Workflow"
category: "ai-agents"
subcategory: "automation"
tags: ["ai", "openclaw", "automation", "workflow"]
type: "note"
created: "2026-02-20"
updated: "2026-02-22"
source: "claude"
ai_generated: true
---
```

---

## Instrukcja dla Nowych Notatek

### Krok 1: Skopiuj Szablon
```bash
cp /home/ubuntu/clawd/aura-notes/TEMPLATE.md /home/ubuntu/clawd/aura-notes/memory/nowa-notatka.md
```

### Krok 2: Wypełnij Frontmatter
1. **title** - Wpisz zrozumiały tytuł
2. **category** - Wybierz z listy dostępnych kategorii
3. **subcategory** - Opcjonalnie, wybierz lub zostaw puste
4. **tags** - Dodaj 3-7 tagów opisujących treść
5. **type** - Wybierz odpowiedni typ notatki
6. **created** / **updated** - Ustaw dzisiejszą datę (YYYY-MM-DD)
7. **source** - Określ skąd pochodzi treść
8. **ai_generated** - true/false

### Krok 3: Napisz Treść
Zachowaj spójność formatowania z istniejącymi notatkami.

### Krok 4: Weryfikacja
Upewnij się, że:
- [ ] Frontmatter zaczyna się od `---`
- [ ] Frontmatter kończy się `---`
- [ ] Wszystkie wymagane pola są wypełnione
- [ ] YAML jest poprawny (sprawdź w validatorze jeśli potrzeba)

---

## Walidacja YAML

Aby sprawdzić czy frontmatter jest poprawny, możesz użyć:

```bash
# Sprawdź poprawność YAML
head -n 12 notatka.md | yq eval '.' -

# Lub użyj online YAML validator
# https://www.yamllint.com/
```

---

## Integracja z Obsidian

Jeśli używasz Obsidian, frontmatter jest automatycznie rozpoznawany jako **Properties**:
- Widoczne w panelu bocznym
- Możliwość filtrowania w graph view
- Wsparcie dla wyszukiwania

---

*Ostatnia aktualizacja: 2026-03-01*
*Wersja systemu frontmatter: 1.0*
