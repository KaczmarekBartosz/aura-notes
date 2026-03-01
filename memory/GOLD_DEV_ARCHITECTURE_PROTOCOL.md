# GOLD DEV & ARCHITECTURE PROTOCOL 🛠️

**Wersja:** 1.0  
**Data utworzenia:** 2026-02-27  
**Ostatnia aktualizacja:** 2026-02-27  
**Status:** AKTYWNY

---

## 🎯 CO TO JEST

Kompletny playbook technologiczny dla budowania aplikacji, SaaS i systemów AI w 2026 roku. Od stacku technologicznego, przez architekturę, po konkretne wzorce kodowania z AI. Nie teoria — tylko to, co działa teraz.

---

## 📚 ŹRÓDŁA

- **@steipete** — Peter Steinberger, twórca OpenClaw, agentic engineering
- **@alexcooldev** — Alex Nguyen, indie hacking, app development
- **@farhanrizzvi** — architektura systemów, best practices
- **@raihanarbix** — UI/UX development, frontend patterns
- **@code_rams** — agentic engineering, workflow AI
- **@KacperTrzepiec1** — Claude Code, konfiguracja agentów
- **@miroburn** — synchronizacja kontekstu, AI w firmie

---

## 🏗️ SEKCJA 1: TECH STACK 2026

### 1.1 Core Stack dla SaaS/App

| Warstwa | Technologia | Użycie | Alternatywy |
|---------|-------------|--------|-------------|
| **Frontend** | Next.js 15 (App Router) | Strony, dashboardy, misje | Remix, SvelteKit |
| **Backend** | Convex / Supabase | Real-time DB, auth, storage | Firebase, PlanetScale |
| **Styling** | Tailwind CSS v4 | Szybki UI, responsywność | UnoCSS, Panda |
| **Komponenty** | ShadCN UI | Pre-built, dostępne | Radix, Headless |
| **Animacje** | Framer Motion | Mikrointerakcje, przejścia | GSAP, Motion One |
| **Icons** | Lucide React | Spójność wizualna | Heroicons, Tabler |

### 1.2 Stack dla Agentów AI

| Komponent | Narzędzie | Koszt/mies. | Kiedy użyć |
|-----------|-----------|-------------|------------|
| **Orchestracja** | OpenClaw | $0 (self-hosted) | Główny system agentów |
| **Coding** | GPT-5.3 Codex / Opus 4.6 | $20-200 | Główny development |
| **Frontend** | Gemini 3.1 Pro | $0-20 | UI/UX, design code |
| **Zadania ogólne** | MiniMax M2.5 | $0-10 (via OpenRouter) | Szybkie taski, heartbeats |
| **Research** | Grok 4.1 | $8-16 | X/Twitter, news |
| **Images** | Nano Banana Pro | $0-20 | Grafiki, mockupy |
| **Video** | Seedance 2.0 | $0-25 | Content video |

### 1.3 $0 Stack (dla startu)

```
IDE:        Google AntiGravity (100% free)
Docs:       SuperDocs (open source)
Database:   Supabase (Nano plan)
Auth:       Stack Auth (do 10K users)
LLM:        OpenRouter / Gemini AI Studio
Git:        GitHub/GitLab (free)
Deploy:     Vercel (free tier)
Analytics:  PostHog + Clarity + GA (wszystkie free)
```

**Całkowity koszt startu:** $0  
**Miesięczny koszt przy skali:** $50-200

---

## 🧠 SEKCJA 2: AGENTIC ENGINEERING

### 2.1 Agentic Engineering > Vibe Coding

**Zasada:** Prompt tricks nie wystarczą. Architektura systemu decyduje o jakości agenta.

**Core Principles:**

1. **Czysty kod = lepszy agent**
   - Czytelne nazewnictwo
   - Dobra struktura
   - Czysta architektura
   - Agent działa lepiej na uporządkowanym kodzie

2. **Start stupid simple**
   - OpenClaw zaczął jako 1-godzinny WhatsApp → CLI relay
   - Minimalny core system
   - Dodawaj jedną regułę na raz
   - Aggressive pruning

3. **Więcej promptów ≠ więcej inteligencji**
   - Rozdęte instrukcje obniżają jakość
   - Mały system. Tight loop. Szybka iteracja.

4. **Samomodyfikujące się agenty**
   - Agent inspekcjonuje własne narzędzia
   - Czyta dokumentację
   - Analizuje błędy
   - Pyta: "Co widzisz? Co Cię myli? Gdzie jest błąd?"

### 2.2 Wzorce Architektury Agentów

**Pattern 1: Skill-Based Shell Agent**

```
Hierarchia:
├── Shell (kontener hosta)
│   └── Sprawdź zależności przed odpowiedzią
├── Skills (/skills/)
│   └── Każdy powtarzalny task = osobny skill
└── Memory (Compaction)
    └── Podsumowuj stan, zapisuj artefakty

Execution Rules:
- Description over marketing (kiedy użyć / kiedy nie)
- Artifacts first (wszystko do /mnt/data/)
- Negative examples (dokumentuj porażki)
```

**Pattern 2: Sub-agent Delegation**

```
Główny Agent (Orchestrator)
├── Sub-agent 1: Research
├── Sub-agent 2: Coding
├── Sub-agent 3: Testing
└── Sub-agent 4: Deployment

Każdy sub-agent:
- Ma jasne kryteria sukcesu
- Waliduje własną pracę
- Raportuje do orchestratora
```

**Pattern 3: Memory Architecture**

```
memory/
├── active-tasks.md          # "Save game" (crash recovery)
├── YYYY-MM-DD.md            # Dzienne logi
├── projects.md              # Projekty długoterminowe
├── decisions.md             # Kluczowe decyzje
└── failures.md              # Dokumentowane błędy

Zasada: Jeśli nie jest zapisane w pliku — agent nie pamięta.
```

### 2.3 Reverse Prompting

**Zamiast:** "Co powinienem zrobić?"  
**Zapytaj:** "Co robię źle? Gdzie tracę czas?"

Agent zna Twoje cele, projekty, nawyki. Niech Ci powie, gdzie jesteś nieefektywny.

**Przykładowe odpowiedzi z reverse prompting:**
- "Za dużo kontekstu w jednym prompcie"
- "Powtarzasz te same błędy w nazewnictwie"
- "Możesz zautomatyzować 70% tego workflow"

---

## 🔧 SEKCJA 3: CLAUDE CODE BEST PRACTICES

### 3.1 Konfiguracja Środowiska

**~/.claude/CLAUDE.md:**

```markdown
# Zasady krytyczne

1. "fix errors immediately. don't ask. don't wait."
   → Agent przestaje być pasywny, zaczyna być proaktywny

2. "spawn subagents for all execution. never do inline work."
   → Ty strategizujesz, sub-agenci budują. 10x szybciej.

3. "never force push, delete branches, or rewrite git history."
   → Jedna guardrail, która ratuje przed katastrofą

4. "never guess config changes. read docs first. backup before editing."
   → Zapobiega psuciu własnej konfiguracji
```

### 3.2 Dwa pliki startowe

Agent powinien czytać na start każdej sesji:

**Plik 1: USER.md**
- Kim jesteś
- Jak lubisz pracować
- Czego unikać
- Jak odpowiadać

**Plik 2: AI_RULES.md** (pisany przez AI)
- Jak reagować na feedback
- Kiedy pytać, kiedy działać
- Jaki ton trzymać

**Auto-aktualizacja:**
```
Komenda: /reflect
AI skanuje rozmowę, szuka sygnałów:
→ "za długie" 2x → dodaj regułę "odpowiadaj krócej"
→ "nie pisz game-changer" → czarna lista słów
```

### 3.3 Model Routing

| Zadanie | Model | Dlaczego |
|---------|-------|----------|
| Orchestracja | Opus 4.6 | Najlepszy do planowania |
| Coding | GPT-5.3 Codex | Najmniej handholdingu |
| Frontend/UI | Gemini 3.1 Pro | Creative code |
| Szybkie taski | MiniMax M2.5 | 95% tańszy niż Opus |
| Debugowanie | GPT-5.2 | Szybki, precyzyjny |
| Zewnętrzne źródła | Opus 4.6 | Odporny na prompt injection |

### 3.4 Security Best Practices

1. **Sandboxing** — agent działa w izolowanym środowisku
2. **Allowlists** — tylko zatwierdzone komendy
3. **Scoped permissions** — minimalne uprawnienia
4. **Explicit approvals** — potwierdzenia przy ryzykownych akcjach
5. **Zewnętrzna treść = silny model** — Opus dla web content, słabsze modele są podatne na prompt injection

---

## 🏛️ SEKCJA 4: ARCHITEKTURA SYSTEMÓW

### 4.1 Struktura Folderów OpenClaw

```
workspace/
├── agents/
│   ├── registry.json
│   ├── coder/
│   │   ├── SOUL.md
│   │   └── RULES.md
│   └── researcher/
├── memory/
│   ├── 2026-02-27.md
│   ├── projects.md
│   └── decisions.md
├── state/
│   ├── servers.json
│   ├── crons.json
│   └── revenue.json
├── content/
│   └── queue.md
├── clients/
│   └── client-name.md
├── skills/
│   └── [skill-name]/
└── shared-context/
    ├── priorities.md
    └── agent-outputs/
```

### 4.2 HEARTBEAT.md (Proactive Status)

```markdown
## Aktywne projekty
- [Nazwa] — status, next step

## Immediate actions
- [Co do zrobienia dzisiaj]

## Background tasks
- [Co działa, co zrobione]
```

Agent czyta to przy każdym starcie i:
- Fluguje jeśli coś jest stare/uszkodzone
- Proponuje następne kroki
- Nie czeka na pytanie

### 4.3 System Notyfikacji i Kontekstu

**Architektura 3-fazowa:**

**Faza 1: RĘCZNIE**
- Szef przygotowuje kontekst
- Wyciąga z systemów (API, ręcznie)
- Dodaje cele, KPI
- Rozsyła zespołowi raz w tygodniu

**Faza 2: API w 1 stronę**
- System zbiera dane
- Wystawia po API
- Agenci pobierają pliki kontekstowe

**Faza 3: API w 2 strony**
- Agenci wrzucają dane do "recepcji"
- System przetwarza
- Automatyczna synchronizacja

### 4.4 Mission Control Dashboard

**Stack:** Next.js 15 + Convex + Tailwind + Framer Motion

**Widoki:**
1. **Home** — System Health, Agent Status, Cron Health, Revenue
2. **Ops** — Tasks, Calendar, Operations
3. **Agents** — Registry, Models, Personalities
4. **Chat** — Interface do agentów
5. **Content** — Pipeline, Drafts
6. **Comms** — CRM, Discord, Telegram
7. **Knowledge** — Search, Ecosystem
8. **Code** — Repos, Commits, PRs

---

## 💻 SEKCJA 5: KODOWANIE Z AI

### 5.1 Prompt Architecture dla Kodu

```markdown
<context>
[Opis systemu, architektury, ograniczeń]
</context>

<role>
[Kim AI ma być: principal engineer, security-focused, etc.]
</role>

<response_guidelines>
- Read architekturę przed kodem
- State: filepath, purpose, dependencies, consumers
- Strict separation of concerns
- Fully typed, production-ready
- Error handling comprehensive
- Suggest tests dla każdej zmiany
</response_guidelines>

<task_criteria>
[Concrete task with acceptance criteria]
</task_criteria>
```

### 5.2 Code Review Checklist

Przed każdym commitem:

- [ ] Typy zdefiniowane
- [ ] Error handling dla edge cases
- [ ] Input validation
- [ ] Environment variables dla sekretów
- [ ] Testy (unit + integration)
- [ ] Dokumentacja
- [ ] Security check (brak hardcoded secrets)
- [ ] Performance (nie dodajemy N+1 queries)

### 5.3 Fix Forward Mindset

**Zamiast rollback panic:**
- Patch quickly
- Re-run
- Keep main deployable

**Post-build questions:**
- "What should we refactor next?"
- "Where is complexity increasing?"
- "What tests are missing?"

### 5.4 Vibe Coding Best Practices

1. **Generuj 10 wariantów** — poproś o 10 plików HTML, każdy z 4 wariacjami feature. Wybierasz najlepsze.

2. **Frontend UI stack:**
   - Zaproponuj scope
   - 10 HTML files, 4 variations each
   - Cherry pick
   - Saves hours of reprompting

3. **Gamifikacja:**
   - Dopamine loops scale
   - Boring apps die
   - Dodaj mascota, gamification layer

---

## 🔄 SEKCJA 6: AUTOMATYZACJA WORKFLOW

### 6.1 Cron vs Heartbeats

**Heartbeats:**
- Co ~30 min
- Batchowane checki (email + calendar + mentions)
- Krótki, <20 linii
- Keep it simple

**Cron jobs:**
- Precyzyjne timingi
- Daily content ideas at 6am
- Overnight research at 2am
- Tech watch at 8am
- Każdy w izolacji, własny kontekst

### 6.2 Task Queue Pattern

```
Źródła → Baza (DynamoDB/Convex) → Agent Tasks

Źródła:
- Maile od firm (SaaS, API)
- CRM daily digest
- Analytics (ruch + AI analiza)
- Grok Intel (trendy, konkurencja)
- CloudWatch (błędy)

Agent Tasks:
1. Pobiera wszystko w kolejkę
2. Pokazuje po jednej wiadomości
3. Analizuje w kontekście projektów
4. Proponuje: usuń / zamknij / stwórz task
```

### 6.3 One Process Per Week

**Zasada:** Nie ogarniaj wszystkiego od razu.

- Week 1: Automatyzacja maili (1 skrzynka)
- Week 2: Dodaj drugą skrzynkę
- Week 3: Kategoryzacja
- Week 4: Auto-drafty
- Week 5+: Skaluj

---

## 📊 SEKCJA 7: MONITORING I ANALITYKA

### 7.1 Metryki Agenta

| Metryka | Target | Jak mierzyć |
|---------|--------|-------------|
| Tasks completed/day | 10+ | Logi w state/ |
| Success rate | >90% | Failed vs completed |
| Avg response time | <30s | Timestamp diff |
| Token efficiency | Spadający trend | Tokens/task over time |
| Cost per task | <$0.10 | $/task |

### 7.2 Self-Review Loop

**Co 4h:** Agent pyta samego siebie:
- "Co zrobiłem źle?"
- "Jaki wzorzec się powtarza?"
- "Co powinienem zmienić?"

**Widoczne efekty po 30 dniach:**
- Wyłapanie błędów przed użytkownikiem
- Naprawa powtarzających się patternów
- Auto-aktualizacja reguł

### 7.3 Cost Optimization

**Darmowe alternatywy:**
- Kimi K2.5 via NVIDIA (darmowe API)
- GLM-5 via Z.ai (darmowe tier)
- MiniMax M2.5 via OpenRouter (tanie)
- Gemini AI Studio (darmowe testowanie)

**Koszty miesięczne (przykład):**
```
OpenAI GPT:        $90 (Team plan)
Claude Max:        $100
OpenRouter:        $30
Vercel:            $20
Supabase:          $25
Other tools:       $50
-------------------
RAZEM:            ~$315/mies.
```

---

## 🚀 SEKCJA 8: CHECKLISTY

### 8.1 Checklist: Nowy Projekt

- [ ] Zdefiniuj architekturę (dokument)
- [ ] Wybierz stack technologiczny
- [ ] Skonfiguruj środowisko (env vars, secrets)
- [ ] Utwórz strukturę folderów
- [ ] Skonfiguruj agenta (SOUL.md, RULES.md)
- [ ] Ustaw CI/CD (Vercel, GitHub Actions)
- [ ] Dodaj monitoring (Sentry, LogRocket)
- [ ] Utwórz backup strategy
- [ ] Dokumentacja (README, ARCHITECTURE.md)

### 8.2 Checklist: Kodowanie z AI

- [ ] Podaj kontekst (architektura, constraints)
- [ ] Zdefiniuj rolę AI (engineer, reviewer)
- [ ] Określ acceptance criteria
- [ ] Review: typy, error handling, security
- [ ] Testy (unit + integration)
- [ ] Dokumentacja
- [ ] Commit z opisem (conventional commits)

### 8.3 Checklist: Deployment

- [ ] Wszystkie testy przechodzą
- [ ] Build nie ma błędów
- [ ] Environment variables ustawione
- [ ] Database migrations ready
- [ ] Rollback plan przygotowany
- [ ] Monitoring aktywny
- [ ] Dokumentacja zaktualizowana

### 8.4 Checklist: Security

- [ ] Brak hardcoded secrets
- [ ] Input validation wszędzie
- [ ] Rate limiting API
- [ ] Auth/Authz działa
- [ ] CORS skonfigurowane
- [ ] Dependencies zaktualizowane
- [ ] Security headers ustawione

---

## 🎓 SEKCJA 9: NAUKA I ROZWÓJ

### 9.1 Jak uczyć się AI-assisted coding

1. **Używaj codziennie** — nie tylko jak masz czas
2. **Zbuduj coś prawdziwego** — nie ćwicz na promptach
3. **Naucz AI, kim jesteś** — zanim o cokolwiek poprosisz
4. **Nie pytaj o radę** — daj konkretny problem
5. **Zostaw AI odpowiadanie za Ciebie** — maile, podsumowania
6. **Uruchom kilka agentów naraz** — różne perspektywy
7. **Buduj narzędzia pod siebie** — nie pod wszystkich
8. **Jeden proces automatyzacji co tydzień**
9. **Nie używaj AI do tego, co lubisz robić**
10. **Mierz czas, nie jakość odpowiedzi**

### 9.2 Resources do Śledzenia

**Ludzie:**
- @steipete — OpenClaw, agentic engineering
- @bcherny — Claude Code creator
- @code_rams — agentic patterns
- @KacperTrzepiec1 — AI workflows
- @miroburn — kontekst, synchronizacja

**Tools:**
- Claude Code + Antigravity combo
- OpenClaw + Codex
- MiniMax M2.5 (darmowy, wydajny)
- Kimi K2.5 (najlepszy stosunek jakości do ceny)

### 9.3 Common Anti-Patterns

❌ **Rozdęte pliki pamięci** (>200 linii w HEARTBEAT)  
❌ **Brak kryteriów sukcesu** dla sub-agentów  
❌ **Inline work** zamiast delegacji  
❌ **Brak dokumentacji** failure patterns  
❌ **Zgadywanie** zamiast czytania dokumentacji  
❌ **Force push** bez myślenia  
❌ **Jeden model do wszystkiego**

---

## 📝 SEKCJA 10: QUICK REFERENCE

### 10.1 Komendy OpenClaw

```bash
# Status i diagnostyka
openclaw status
openclaw doctor
openclaw doctor --fix

# Gateway
openclaw gateway start
openclaw gateway stop
openclaw gateway restart

# Aktualizacja
npm uninstall -g openclaw
npm i -g openclaw@latest
```

### 10.2 Model Aliases (OpenClaw)

```
kimi-coding/k2p5      → Kimi K2.5
claude-opus-4-6       → Claude Opus 4.6
gpt-codex-5-3         → GPT-5.3 Codex
minimax-m2-5          → MiniMax M2.5
glm-5                 → GLM-5
gemini-3-pro          → Gemini 3 Pro
```

### 10.3 Claude Code z innym modelem

```bash
# Kimi K2.5
claude --model kimi-k2-5

# MiniMax M2.5  
claude --model minimax-m2-5

# GLM-5
claude --model glm-5
```

---

## ✅ PODSUMOWANIE

**Gold Dev & Architecture Protocol** to Twój kompletny przewodnik po budowaniu systemów z AI w 2026 roku.

**Kluczowe takeaways:**

1. **Agentic engineering > vibe coding** — architektura > prompt tricks
2. **Skill-based shell agent** — systematyczne podejście do agentów
3. **Memory architecture** — split na active/daily/long-term
4. **Sub-agent delegation** — 10x szybciej przez paralelizm
5. **Reverse prompting** — AI mówi Ci, co robisz źle
6. **Fix forward** — nie rollback, tylko szybki patch
7. **Jeden proces tygodniowo** — nie wszystko na raz

---

**Następne kroki:**
1. Zaimplementuj strukturę folderów
2. Skonfiguruj CLAUDE.md i HEARTBEAT.md
3. Wybierz swój stack
4. Zbuduj pierwszego sub-agenta
5. Iteruj i optymalizuj

---

*Protokół utworzony przez Aura/OpenClaw*  
*Źródła: @steipete @alexcooldev @code_rams @KacperTrzepiec1 @miroburn*  
*Na podstawie zakładek X z 2026*
