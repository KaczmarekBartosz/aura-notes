# Prompt-Architect Pattern

## Architektura

**To jest SKILL, nie agent.**

| Element | Co to jest | Gdzie żyje |
|---------|-----------|------------|
| **Skill** | Moduł wiedzy (SKILL.md + zasoby) | `~/.openclaw/skills/prompt-architect/` |
| **Agent** | Ja (Aura) + każda instancja, która ładuje skill | Runtime OpenClaw |
| **Konfiguracja** | Mapowanie skill → agent | `~/.openclaw/openclaw.json` |

## Jak to działa

1. **Rejestracja**: Skill dodany do `skills.entries` w `openclaw.json`
2. **Trigger**: OpenClaw czyta tylko `name` i `description` ze SKILL.md (zawsze w pamięci)
3. **Aktywacja**: Gdy zapytanie pasuje do description → cały SKILL.md ładuje się do kontekstu
4. **Wykonanie**: Agent (ja) stosuje instrukcje ze SKILL.md

## Struktura SKILL.md

```yaml
---
name: prompt-architect
description: [KRYTYCZNE — to decyduje kiedy skill się uruchamia]
---

# Instrukcje dla agenta
# - Workflow
# - Template'y
# - Przykłady
# - Guidelines
```

## Kiedy używać

**Używaj tego skill'a gdy:**
- "Zbuduj prompt do..."
- "Potrzebuję struktury dla zapytania o..."
- "Jak powinienem poprosić AI o..."
- "Stwórz template dla..."

## Workflow użycia

1. **User mówi**: "Zbuduj prompt do X"
2. **Ja (z skill)**: Zadaję pytania wywiadowcze (task, success, context, reference)
3. **Konstrukcja**: Buduję 8-sekcyjny prompt wg schematu
4. **Output**: Prezentuję gotowy prompt do skopiowania

## Schemat 8-sekcyjny (Anatomy of a Claude Prompt)

| Sekcja | Kolor | Cel |
|--------|-------|-----|
| Task | 🔴 Red | Cel + kryteria sukcesu |
| Context Files | 🔵 Blue | Pliki do przeczytania |
| Reference | 🟢 Teal | Przykład do reverse-engineering |
| Blueprint | 🟡 Yellow | Co sprawia że reference działa |
| Success Brief | 🟡 Yellow | Typ, długość, reakcja |
| Rules | 🩷 Pink | Ograniczenia |
| Conversation | 🟣 Purple | Pytania przed startem |
| Plan | 🔴 Red | Kroki wykonania (max 5) |
| Alignment | 🔵 Blue | Potwierdzenie przed pracą |

## Pliki

- **SKILL.md**: `~/.openclaw/skills/prompt-architect/SKILL.md`
- **Przykłady**: `~/.openclaw/skills/prompt-architect/references/prompt-anatomy-examples.md`
- **Konfiguracja**: `~/.openclaw/openclaw.json` → `skills.entries.prompt-architect`

## Customizacja

Aby dodać warianty (np. "prompt-architect-code", "prompt-architect-marketing"):

1. Skopiuj strukturę `prompt-architect/`
2. Zmień `name` i `description` w frontmatter
3. Dostosuj template do domeny
4. Dodaj do `skills.entries` w openclaw.json

## Zasady pisania skill'i (dla przyszłości)

1. **Description = trigger** — musi być precyzyjny, bo to decyduje o użyciu
2. **Concise > Verbose** — SKILL.md < 500 linii, reszta do references/
3. **Progressive Disclosure** — metadane zawsze, body tylko gdy potrzebne
4. **Imperative voice** — instrukcje w trybie rozkazującym
5. **Concrete examples** — szablony > wyjaśnienia

## Użycie w praktyce

**Przykład interakcji:**

> Bartek: "Zbuduj prompt do przebudowy nawigacji w mojej apce"

> Aura: [Używa prompt-architect skill]
> "Chwilka, zadaję kilka pytań:
> 1. Jaki dokładnie TASK chcesz osiągnąć?
> 2. Co oznacza SUCCESS?
> 3. Masz jakieś REFERENCE — screeny, linki, opisy?
> 4. Jakie RULES/obostrzenia obowiązują?"

> [Po wywiadzie]
> "Oto Twój prompt w schemacie 8-sekcyjnym..."

---
*Skill aktywny. Gotowa do użycia.*
