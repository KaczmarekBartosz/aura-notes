---
title: "GOLD AI AGENTS PROTOCOL"
subcategory: "automation"
category: "ai-agents"
tags: ["ai", "automation", "openclaw"]
type: "protocol"
created: "2026-02-01"
updated: "2026-02-01"
source: "x-bookmark"
ai_generated: false
---

# GOLD AI AGENTS PROTOCOL
## Kompletny system budowania i zarządzania autonomicznymi agentami AI

**Wersja:** 1.0  
**Źródło:** Kompilacja zakładek X/Twitter (@AlexFinn, @EXM7777, @code_rams, @moritzkremb, @miroburn, @szarketh, @kaostyl, @KacperTrzepiec1)  
**Data kompilacji:** Luty 2026

---

## SPIS TREŚCI

1. [Filozofia Agentów AI](#1-filozofia-agentów-ai)
2. [Architektura Systemu Agentów](#2-architektura-systemu-agentów)
3. [Protokół Memory (Pamięci)](#3-protokół-memory-pamięci)
4. [Protokół Sub-Agentów](#4-protokół-sub-agentów)
5. [Protokół Automatyzacji (Cron vs Heartbeat)](#5-protokół-automatyzacji-cron-vs-heartbeat)
6. [Protokół Mission Control](#6-protokół-mission-control)
7. [Protokół Bezpieczeństwa](#7-protokół-bezpieczeństwa)
8. [Stack Technologiczny](#8-stack-technologiczny)
9. [Checklist Konfiguracji](#9-checklist-konfiguracji)
10. [Typowe Błędy](#10-typowe-błędy)

---

## 1. FILOZOFIA AGENTÓW AI

### 1.1 Definicja Agenta

> "Agent to nie chatbot. Agent to pracownik z pamięcią, osobowością i celem." — Alex Finn

**Różnica kluczowa:**
- **Chatbot:** Odpowiada na pytania, zapomina po sesji
- **Agent:** Pamięta, uczy się, działa proaktywnie, koordynuje innych agentów

### 1.2 Misja jako Kompas

**Zasada Alex Finna:**
> "Musisz dać swojemu OpenClaw misję, którą umieszcza na górze Mission Control. Teraz, gdy agent jest bezczynny, możesz zapytać: 'co możemy zrobić, aby przybliżyć się do naszej misji?'"

**Przykładowe Misje:**
- "Zbudować autonomiczną organizację agentów AI, która pracuje dla mnie 24/7 i wytwarza wartość"
- "Stworzyć system AI, który zarządza całym moim cyfrowym workflow — od researchu po publikację"
- "Zautomatyzować 80% powtarzalnych zadań w mojej pracy kreatywnej"

### 1.3 Od Chatbota do Pracownika

**5 Elementów Transformacji (Alex Finn):**

| Element | Chatbot | Agent/Pracownik |
|---------|---------|-----------------|
| Pamięć | Brak | Pliki .md, wektory, daily logs |
| Cel | Brak | Mission statement |
| Proaktywność | Reaktywny | Sam inicjuje zadania |
| Narzędzia | Ograniczone | Pełny dostęp do systemu |
| Delegacja | Brak | Sub-agenci, workflow |

---

## 2. ARCHITEKTURA SYSTEMU AGENTÓW

### 2.1 Struktura Zespołu Agentów

**Model 6-Agentów (Szark / @szarketh):**

| Agent | Rola | Odpowiedzialność |
|-------|------|------------------|
| **IT** | Dział techniczny | Tworzy nowych agentów, utrzymuje infrastrukturę |
| **Marketing** | Content & Growth | Tworzy treści, analizuje trendy, zarządza publikacją |
| **Research** | Badania i analiza | Monitoruje rynek, konkurencję, nowe technologie |
| **Operacje** | Automatyzacja | Zarządza workflow, cronami, powiadomieniami |
| **Biznes** | Strategia | Analizuje KPI, proponuje decyzje biznesowe |
| **QC** | Quality Control | Weryfikuje output, pilnuje standardów |

### 2.2 Komunikacja Między Agentami

**Centralny System (@miroburn):**
1. **Notion jako hub** — wspólna przestrzeń dla wszystkich agentów
2. **API Context** — każdy agent pobiera aktualny kontekst przed działaniem
3. **Recepcja** — wspólna kolejka zadań i aktualizacji

**Alternatywny Model (Discord/Telegram):**
- Główny kanał: Aktualizacje systemowe
- Thread per task: Izolowane sesje robocze
- Statusline w voice channel: Dynamiczne statusy

### 2.3 Routing Zadań

**Zasada:** Agent nie wykonuje bezpośrednio — deleguje.

```
Użytkownik → Główny Agent → Analiza → Delegacja → Sub-agenci
                                          ↓
                                    Równoległe wykonanie
                                          ↓
                                   Weryfikacja → Output
```

---

## 3. PROTOKÓŁ MEMORY (PAMIĘCI)

### 3.1 Architektura Pamięci (@kaostyl, @KacperTrzepiec1)

**Split Memory Model:**

| Plik | Zawartość | Częstotliwość aktualizacji |
|------|-----------|---------------------------|
| `memory/active-tasks.md` | Aktualne zadania, "save game" | Real-time |
| `memory/YYYY-MM-DD.md` | Daily logs, surowe notatki | Codziennie |
| `memory/user-profile.md` | Kim jest użytkownik, cele, preferencje | Rzadko |
| `memory/lessons-learned.md` | Wyciągnięte wnioski | Co kilka dni |
| `memory/projects.md` | Status projektów, kontekst | Na bieżąco |

### 3.2 Protokół Daily Log

**Struktura pliku `memory/2026-02-26.md`:**

```markdown
# 2026-02-26 — Daily Log

## 📋 Zadania Wykonane
- [x] Konfiguracja nowego agenta research
- [x] Automatyzacja backupu (cron)

## 💡 Decyzje Podjęte
- Przełączono model główny na MiniMax M2.5 (koszt ↓ 80%)

## ❌ Błędy i Poprawki
- Błąd: Agent nie wczytywał USER.md
- Fix: Dodano explicit read na starcie sesji

## 📝 Kontekst Przydatny
- Użytkownik preferuje krótkie odpowiedzi
- Nowy projekt: Aurafit — priorytet #1
```

### 3.3 Protokół REFLECT (@KacperTrzepiec1)

**Komenda:** `/reflect`

**Co robi agent:**
1. Skanuje całą rozmowę
2. Szuka sygnałów zmian:
   - "za długie" → dodaje zasadę "odpowiadaj krócej"
   - "nie pisz game-changer" → czarna lista słów
   - Poprawki zachowania → aktualizuje RULES.md
3. Aktualizuje pliki pamięci

### 3.4 Memory Files — MUST HAVE

**Wymagane pliki w workspace:**

| Plik | Przeznaczenie | Co wrzucać |
|------|---------------|------------|
| `USER.md` | Profil użytkownika | Cele, preferencje, styl pracy |
| `AGENTS.md` | Instrukcje dla agenta | Jak reagować, kiedy pytać |
| `CLAUDE.md` / `OPENCLAW.md` | Zasady techniczne | Stack, konwencje, workflow |
| `HEARTBEAT.md` | Status systemu | Aktywne zadania, blokady |

---

## 4. PROTOKÓŁ SUB-AGENTÓW

### 4.1 Zasada Delegacji

**Golden Rule (@johann_sath):**
> "Spawn subagents for all execution. Never do inline work. You strategize, subagents build. 10x faster."

**Kiedy Delegować:**
- [x] Zadanie > 15 minut pracy
- [x] Można podzielić na niezależne części
- [x] Wymaga specjalizacji (research, kod, design)
- [x] Jest powtarzalne

### 4.2 Tworzenie Sub-Agenta

**Prompt Template:**

```
Create a sub-agent with the following context:

ROLE: [Researcher/Coder/Writer/etc.]
TASK: [Konkretne zadanie]
CONTEXT: [Wszystko co agent musi wiedzieć]
SUCCESS CRITERIA: [Jak ocenić czy zadanie zrobione]
OUTPUT FORMAT: [Jaki format oczekujesz]

IMPORTANT: Do not read any .md files. I will provide all context you need.
```

### 4.3 Parallel Execution

**Wzorzec (@kaostyl):**
```
Zadanie: "Przeanalizuj 10 produktów konkurencji"

→ Sub-agent 1: Produkty 1-3
→ Sub-agent 2: Produkty 4-6  
→ Sub-agent 3: Produkty 7-10

Wszystkie równolegle → Merge wyników → Final report
```

### 4.4 Nested Sub-Agents

**Zaawansowany Wzorzec (@jumperz):**
> "Mój agent John dostał zadanie researchu. Spawnął 3 internów do równoległego badania. Jeden z nich znalazł coś na tyle głębokiego, że uruchomił własnego interna, aby kopać dalej."

**Zasada:** Sub-agent może tworzyć własnych sub-agentów, gdy natrafi na pod-zadanie wymagające głębszej analizy.

---

## 5. PROTOKÓŁ AUTOMATYZACJI (CRON VS HEARTBEAT)

### 5.1 Cron Jobs — Precyzyjne Zadania

**Kiedy używać:** Konkretne zadania o określonym czasie

**Przykłady:**

| Zadanie | Harmonogram | Model |
|---------|-------------|-------|
| Daily Briefing | 6:00 AM | Haiku/MiniMax |
| Research Scout | 2:00 AM (noc) | Opus |
| Content Ideas | 8:00 AM | Sonnet |
| Backup Systemu | 3:00 AM | MiniMax |
| Analytics Review | Niedziela 10:00 | Opus |

### 5.2 Heartbeat — Monitoring Systemu

**Zasada (@kaostyl):**
> "Keep it under 20 lines. Heavy work goes in cron jobs, not heartbeats."

**Struktura HEARTBEAT.md:**

```markdown
# HEARTBEAT — Sprawdź co 30 min

- [ ] Czy `active-tasks.md` jest aktualne?
- [ ] Czy są sesje "zombie" (> 2h bez aktywności)?
- [ ] Czy jakiś cron nie wykonał się > 24h?
- [ ] Self-review co 4h: Co mogę poprawić?
```

### 5.3 Wybór Modelu do Automatyzacji

**Zasada (@kaostyl):**

| Typ Zadania | Model | Dlaczego |
|-------------|-------|----------|
| External content (X, web, email) | Opus / Najsilniejszy | Odporność na prompt injection |
| Internal tasks (pliki, logi) | Sonnet / Średni | Wystarczający, tańszy |
| Heartbeat / Monitoring | MiniMax / Haiku | Szybki, tani |
| Kodowanie | GPT-5.3 Codex | Najlepszy kod |
| Frontend | Gemini 3.1 Pro | Najlepszy design |

---

## 6. PROTOKÓŁ MISSION CONTROL

### 6.1 Definicja

**Mission Control = Dashboard + Command Center**

Centralny hub, gdzie:
- Monitorujesz wszystkich agentów
- Widzisz status zadań
- Zarządzasz workflow
- Przeglądasz analizy

### 6.2 Stack Technologiczny (Kloss / @kloss_xyz)

**Rekomendacja:**
- **Frontend:** Next.js 15 + Tailwind CSS v4 + Framer Motion
- **Backend:** Convex (real-time) lub własne API
- **UI:** ShadCN UI + Lucide icons
- **Design:** Dark mode, glassmorphism, premium aesthetic

### 6.3 Komponenty Mission Control

**Widoki:**

| Sekcja | Co wyświetla |
|--------|--------------|
| **Home** | System Health, Agent Status, Cron Health, Revenue, Content Pipeline |
| **Ops** | Zadania operacyjne, kalendarz, priorytety |
| **Agents** | Lista agentów, ich role, modele, status |
| **Chat** | Interfejs do komunikacji z agentami |
| **Content** | Pipeline treści, statusy, zatwierdzanie |
| **Knowledge** | Baza wiedzy, wyszukiwanie |

### 6.4 Reverse Prompting w Practice

**Technika Alex Finna:**

> "Zamiast pytać 'co mam zrobić?', zapytaj: 'W oparciu o to, co wiesz o mnie, gdzie tracę czas? Jakie workflow możemy zbudować?'"

**Prompt:**
```
Based on my USER.md, AGENTS.md, and our mission statement:

1. What is 1 task we can do RIGHT NOW to get closer to our mission?
2. What workflow should we automate that we're currently doing manually?
3. What tool should we build that doesn't exist yet?
```

---

## 7. PROTOKÓŁ BEZPIECZEŃSTWA

### 7.1 Zasady Bezpieczeństwa (@johann_sath)

**4 Guardrails:**

| Zasada | Implementacja |
|--------|---------------|
| **Proactive Fixes** | "Fix errors immediately. Don't ask. Don't wait." |
| **Sub-agent Execution** | "Spawn subagents for all execution. Never do inline work." |
| **Git Safety** | "Never force push, delete branches, or rewrite git history." |
| **Config Safety** | "Never guess config changes. Read docs first. Backup before editing." |

### 7.2 Sandboxowanie

**Zasady:**
- [ ] Agent ma dostęp tylko do wyznaczonych folderów
- [ ] Brak dostępu do ~/.ssh, ~/.aws bez explicit allow
- [ ] Wrażliwe operacje wymagają approval
- [ ] Wszystkie zmiany przez git (trackable)

### 7.3 Backup i Recovery

**Crash Recovery Pattern (@kaostyl):**

```
START task → Zapisz do active-tasks.md
SPAWN sub-agent → Zapisz session key
COMPLETE → Aktualizuj status

RESTART agenta:
1. Read active-tasks.md
2. Resume from last known state
3. No "what were we doing?"
```

---

## 8. STACK TECHNOLOGICZNY

### 8.1 Current Best Stack (Luty 2026)

**Stack @EXM7777:**

| Zadanie | Model | Uzasadnienie |
|---------|-------|--------------|
| Writing | Claude Opus 4.6 + Kimi K2.5 | Głęboka analiza, styl |
| Coding | GPT-5.3-Codex + Opus 4.6 | Kod produkcyjny |
| General Tasks | MiniMax M2.5 | Szybki, tani, mocny |
| Images | Nano Banana Pro | Najlepsza jakość |
| Video | Seedance 2.0 | Najlepsze rezultaty |

### 8.2 Alternatywy Darmowe / Tanie

| Model | Koszt | Kiedy używać |
|-------|-------|--------------|
| MiniMax M2.5 | ~$0.10/1M tokens | Dzienne zadania, heartbeat |
| GLM-5 (Z.ai) | Darmowy (limit 40 req/min) | Eksperymenty, prototypowanie |
| Kimi K2.5 (NVIDIA) | Darmowy | Kodowanie, research |
| Gemini 3.1 (Google) | Darmowy (Studio) | Frontend, design |

### 8.3 Routing Logic dla Skilli

**Zasada:**
Każdy skill MUSI mieć "Use when / Don't use when"

**Przykład:**
```markdown
## Skill: X Research

**Use when:**
- Potrzebujesz aktualnych informacji z X/Twitter
- Research konkurencji, trendów

**Don't use when:**
- Szukasz ogólnej wiedzy (użyj web_search)
- Potrzebujesz archiwalnych danych > 7 dni
```

---

## 9. CHECKLIST KONFIGURACJI

### 9.1 First-Time Setup

**Day 1 — Brain Dump:**
- [ ] Stwórz `USER.md` — kim jesteś, cele, projekty
- [ ] Stwórz `AGENTS.md` — jak agent ma się zachowywać
- [ ] Stwórz folder `memory/`
- [ ] Dodaj mission statement do głównego prompta

**Day 2 — Tools:**
- [ ] Podłącz Gmail API
- [ ] Podłącz Calendar API
- [ ] Podłącz Notion (opcjonalnie)
- [ ] Skonfiguruj Discord/Telegram dla agentów

**Day 3 — Automation:**
- [ ] Skonfiguruj pierwszego crona (np. daily briefing)
- [ ] Skonfiguruj heartbeat
- [ ] Przetestuj sub-agenta na małym zadaniu

**Day 4 — Mission Control:**
- [ ] Zbuduj lub skonfiguruj dashboard
- [ ] Podłącz wszystkie źródła danych
- [ ] Przetestuj end-to-end

**Day 5 — Iterate:**
- [ ] Przeprowadź pierwszy `/reflect`
- [ ] Zaktualizuj pliki pamięci
- [ ] Dostosuj workflow na podstawie feedbacku

### 9.2 Daily Operations

**Morning Routine:**
- [ ] Sprawdź podsumowanie od agentów (cron output)
- [ ] Przejrzyj aktywne zadania w `active-tasks.md`
- [ ] Zatwierdź/odrzuć zaproponowane zadania

**Evening Routine:**
- [ ] Oznacz zadania jako complete
- [ ] Uruchom `/reflect` jeśli była intensywna sesja
- [ ] Przejrzyj logi błędów

### 9.3 Weekly Review

- [ ] Przegląd wszystkich sub-agentów
- [ ] Analiza kosztów (tokenów)
- [ ] Update `lessons-learned.md`
- [ ] Planowanie zadań na następny tydzień

---

## 10. TYPOWE BŁĘDY

### 10.1 Architektura

| Błąd | Dlaczego szkodliwy | Rozwiązanie |
|------|-------------------|-------------|
| Brak split memory | Agent ładuje za dużo kontekstu | Rozdziel na daily/thematic files |
| Inline execution | Wolne, brak skalowalności | Zawsze deleguj do sub-agentów |
| Bloated HEARTBEAT | Marnuje tokeny | Max 20 linii |
| Brak success criteria | Agent nie wie kiedy skończyć | Definiuj przed spawnem |

### 10.2 Operacyjne

| Błąd | Konsekwencja | Fix |
|------|--------------|-----|
| Słaby model do external content | Prompt injection risk | Zawsze Opus dla web/email |
| Brak backupu configu | Utrata konfiguracji | Auto-backup co 5 min |
| Za duży AGENTS.md | Agent gubi się | Podziel na role |
| Brak crash recovery | Utrata postępu | active-tasks.md pattern |

### 10.3 Strategiczne

**Błąd #1: Traktowanie jak ChatGPT**
> "Większość ludzi używa OpenClaw jak ChatGPT. To jak używanie Ferrari do jazdy po sklep." — Alex Finn

**Błąd #2: Brak Mission Statement**
Bez misji agent nie wie jak priorytetyzować. Każde zadanie jest równie ważne = żadne nie jest ważne.

**Błąd #3: Przekomplikowanie**
Zacznij od 1 agenta i 1 automatyzacji. Nie buduj 22 agentów w tydzień (@szarketh to zaawansowany przypadek).

---

## ZAKOŃCZENIE

### The 80/20 Agent Setup

**Minimalna konfiguracja, która daje 80% wartości:**

1. **USER.md** — 50 linijek o sobie
2. **AGENTS.md** — 30 linijek instrukcji
3. **memory/** — folder na daily logs
4. **1 sub-agent skill** — np. research X
5. **1 cron job** — np. daily briefing o 8am

**Koszt:** <$1/dzień  
**Efekt:** 5x produktywności w porównaniu do chatbota

### Następne Kroki

1. Utwórz pliki pamięci (Day 1)
2. Przeprowadź pierwszy reverse prompt: "Co możemy zautomatyzować?"
3. Zbuduj pierwszego sub-agenta na małym zadaniu
4. Iteruj przez `/reflect` co kilka dni

---

*Protokół opracowany na podstawie doświadczeń zaawansowanych użytkowników OpenClaw. Aktualizuj wraz z rozwojem systemu.*

---

## Aktualizacja 2026-02-26 — nowe sygnały z zakładek

### Orchestrator > do-it-all agent
Nowy powtarzający się pattern: główny agent jako koordynator i planista, subagenci jako egzekucja. Praktycznie daje to większą przepustowość i mniej błędów kontekstowych.

- Source: https://x.com/johann_sath/status/2026909147590177076

### Mobile remote control jako warstwa operacyjna
Sterowanie sesjami coding agentów z telefonu zwiększa ciągłość pracy i skraca czas reakcji na blokery.

- Source: https://x.com/nauczymycieAI/status/2026657047899492671

### Memory layer: Obsidian vault + semantic retrieval
Wzorzec potwierdzony przez użytkowników: daily logs + dobrze ustrukturyzowany vault znacząco poprawia retrieval i jakość decyzji agenta.

- Sources:
  - https://x.com/boyuan_chen/status/2026858910963917022
  - https://x.com/Hesamation/status/2026801420872093708

