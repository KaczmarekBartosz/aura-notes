# Claude Code Mastery — notatki z repo `shanraisshan/claude-code-best-practice`

Data opracowania: 2026-03-06 (Europe/Berlin)
Źródło: https://github.com/shanraisshan/claude-code-best-practice
Analizowany latest commit: `2efeb27880bc2021da7015dcfe474dc6e7049764` (2026-03-05 16:36:21 +0500, Shayan Rais, „updated hyperlinks”)

---

## 1) Co to repo realnie daje

To nie jest „framework”, tylko **playbook konfiguracji i workflowów** dla Claude Code:
- Commands (`.claude/commands/*`)
- Subagents (`.claude/agents/*`)
- Skills (`.claude/skills/*`)
- MCP (`.mcp.json` + `.claude/settings.json`)
- Memory (`CLAUDE.md`, reguły)
- Startup flags CLI
- Hooki

Najważniejszy wzorzec repo: **Command → Agent → Skill** (orchestracja zamiast jednego wielkiego promptu).

---

## 2) Fundament: kiedy używać czego

### Command
Użyj, gdy chcesz stały punkt wejścia typu `/fix-issue`, `/deploy-check`.
- Trzyma flow i kroki
- Może mieć argumenty (`$0`, `$ARGUMENTS`)
- Dobre dla powtarzalnej pracy

**Przykład:**
```md
---
description: Napraw issue po numerze
argument-hint: [issue-number]
allowed-tools: Read, Edit, Write, Bash(gh *), Bash(npm test *)
model: sonnet
---
Napraw issue $0, uruchom testy i przygotuj commit.
```

### Subagent
Użyj, gdy chcesz odseparować rolę/specjalizację (np. QA, security, migration).
- Własny model
- Własne narzędzia
- Własna pamięć (user/project/local)

**Przykład:**
```yaml
---
name: security-reviewer
description: Use PROACTIVELY for security checks
tools: Read, Grep, Glob
model: haiku
permissionMode: plan
memory: project
---
Sprawdzaj luki: secrets, injection, auth bypass, unsafe deserialization.
```

### Skill
Użyj, gdy chcesz **reusable know-how** (procedura/checklista), które Claude odpala na żądanie.
- Może być user-invocable (`/nazwa-skilla`) lub hidden (`user-invocable: false`)

**Przykład:**
```yaml
---
name: pr-checklist
description: Final checklist before PR
user-invocable: true
allowed-tools: Read, Grep
---
1) Testy zielone
2) Lint zielony
3) Brak hardcoded secretów
4) Changelog/ADR zaktualizowany
```

---

## 3) Najważniejsze best practices z repo

1. **Zaczynaj od plan mode** przy złożonych taskach.
2. **Manual compact ~50% contextu** (zamiast czekania na ścianę).
3. **CLAUDE.md krótkie (praktycznie <= 200 linii)** i podzielone logicznie.
4. W monorepo: root CLAUDE.md = zasady wspólne, podfoldery = specyfika domeny.
5. **Commands do workflowów**, subagenty do specjalizacji.
6. Subagenty mają być **feature-specific**, nie „general backend guru”.
7. MCP: nie instaluj 15 serwerów „bo można”; trzymaj realny zestaw produkcyjny.
8. Częste commity i małe kroki.

---

## 4) Memory w Claude Code (krytyczne)

Repo dobrze tłumaczy ładowanie `CLAUDE.md`:
- **Ancestor loading (UP):** pliki `CLAUDE.md` w rodzicach ładują się na starcie.
- **Descendant loading (DOWN):** podrzędne `CLAUDE.md` ładują się leniwie dopiero przy pracy w danym katalogu.
- Sibling branch nie ładuje się automatycznie.

Wniosek praktyczny dla Ciebie:
- root: reguły uniwersalne (git, testy, style decyzji)
- feature/module: lokalne zasady i checklisty
- globalnie (`~/.claude/CLAUDE.md`): osobiste preferencje, które chcesz wszędzie

---

## 5) Settings hierarchy i kontrola bezpieczeństwa

Repo podkreśla hierarchię ustawień:
1. CLI args (najwyżej)
2. `.claude/settings.local.json`
3. `.claude/settings.json`
4. `~/.claude/settings.local.json`
5. `~/.claude/settings.json`
+ managed policy (organizacyjna)

Dwie ważne rzeczy:
- `deny` ma najwyższy priorytet bezpieczeństwa.
- listy uprawnień często się **mergują**, nie zastępują.

**Bezpieczny baseline uprawnień (pragmatyczny):**
```json
{
  "permissions": {
    "allow": ["Edit(*)", "Write(*)", "Bash(npm run *)", "Bash(git status)", "Bash(git diff *)"],
    "ask": ["Bash(git push *)", "Bash(rm *)"],
    "deny": ["Read(.env)", "Read(./secrets/**)"]
  }
}
```

---

## 6) MCP: co warto mieć, a co jest overkill

Z repo: sensowny „daily set”:
- Context7 (aktualna dokumentacja bibliotek)
- Playwright MCP (testy UI, automatyzacja)
- Claude in Chrome / Chrome DevTools MCP (debug frontendu)
- DeepWiki (orientacja po repo)

Wzorzec pracy:
- **Research:** Context7 + DeepWiki
- **Implement/Test UI:** Playwright/Chrome MCP
- **Dokumentacja:** generowanie diagramów/notatek

---

## 7) Subagents — konfiguracja, która ma sens

Pola najbardziej praktyczne:
- `tools` (twarda kontrola)
- `model` (`haiku/sonnet/opus/inherit`)
- `permissionMode`
- `maxTurns`
- `skills` (preload)
- `memory` (`user/project/local`)
- `isolation: worktree` dla bezpiecznej separacji zmian

**Przykład produkcyjny:**
```yaml
---
name: migration-agent
description: Use PROACTIVELY for DB and schema migrations
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
permissionMode: acceptEdits
maxTurns: 20
memory: project
isolation: worktree
---
Przy każdej migracji: schema diff, backward compatibility, rollback plan, test smoke.
```

---

## 8) CLI startup flags, które realnie robią robotę

Najbardziej użyteczne z repo:
- `--continue`, `--resume`
- `--model <...>`
- `--permission-mode <...>`
- `--allowedTools <...>`
- `--worktree`
- `--add-dir <path>`
- `--print --output-format json` (headless flow)

**Praktyczne presety:**

### A) Bezpieczny kod + plan
```bash
claude --model sonnet --permission-mode plan
```

### B) Szybkie poprawki w worktree
```bash
claude --worktree --model sonnet --permission-mode acceptEdits
```

### C) Headless w pipeline
```bash
claude --print --output-format json --max-turns 8 "Zrób code review diffa i zwróć listę ryzyk"
```

---

## 9) „Out of the box” dla Twojej lokalnej wersji Claude Code — weryfikacja

### Stan na tym hoście (sprawdzony)
- Komenda `claude --version` zwraca: **command not found**
- Czyli **Claude Code nie jest tu zainstalowany**

### Wniosek
- Zawartości repo **nie da się zastosować out-of-the-box na tym konkretnym środowisku**, bo brakuje samego CLI.
- Po instalacji Claude Code większość rzeczy z repo jest **przenośna 1:1** (pliki `.claude/*`, `.mcp.json`, `CLAUDE.md`) z jednym warunkiem: zgodność wersji funkcji.

### Co może wymagać korekty po instalacji
- pola/frontmatter dodane w nowszych wersjach
- konkretne slash commands/bety
- hook events i nazwy opcji settings

---

## 10) Plan wdrożenia „Claude Code Mastery” dla Ciebie

1. Zainstaluj i zweryfikuj CLI (`claude --version`, `claude doctor`).
2. Zrób baseline:
   - `~/.claude/settings.json` (global)
   - `<repo>/.claude/settings.json` (projekt)
3. Dodaj root `CLAUDE.md` + modułowe `CLAUDE.md` w katalogach domenowych.
4. Zdefiniuj 3-5 commandów do najczęstszych workflowów.
5. Zdefiniuj 2-4 subagentów specjalistycznych.
6. Dodaj 5-10 skills (checklisty, runbooki, quality gates).
7. Włącz MCP minimal set (Context7 + 1 browser MCP + opcjonalnie DeepWiki).
8. Ustal rytm pracy: plan mode → implement → test → commit → compact.

---

## 11) Gotowy minimalny starter (copy/paste)

### `.claude/settings.json`
```json
{
  "$schema": "https://www.schemastore.org/claude-code-settings.json",
  "model": "sonnet",
  "permissions": {
    "allow": ["Edit(*)", "Write(*)", "Bash(npm run *)", "Bash(git status)", "Bash(git diff *)"],
    "ask": ["Bash(git push *)", "Bash(rm *)"],
    "deny": ["Read(.env)", "Read(./secrets/**)"]
  },
  "showTurnDuration": true,
  "respectGitignore": true
}
```

### `CLAUDE.md` (szkic)
```md
# Project Rules
- Start from plan mode for non-trivial tasks
- Keep changes small and testable
- Commit after each completed unit
- No secrets in repo
- If context >50%, compact manually
```

---

## 12) Moja ocena (krótko)

To repo jest bardzo dobre jako **operacyjny wzorzec** dla power-usera Claude Code.
Największa wartość: architektura Command→Agent→Skill + sensowne podejście do memory i permissions.
Największe ryzyko: kopiowanie wszystkiego „hurtem” bez własnego baseline i bez wersyjnej weryfikacji.

