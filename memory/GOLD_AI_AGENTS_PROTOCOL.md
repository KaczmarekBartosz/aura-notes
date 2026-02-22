# GOLD AI AGENTS PROTOCOL
## Kompletny system architektury, delegacji i optymalizacji agentów AI

**Wersja:** 1.0  
**Źródło:** Kompilacja zakładek X/Twitter (@AlexFinn, @EXM7777, @code_rams, @moritzkremb) + Azure/Google/AWS best practices  
**Data kompilacji:** Luty 2026

---

## SPIS TREŚCI

1. [Filozofia Protokołu](#1-filozofia-protokołu)
2. [Architektura Agentów AI](#2-architektura-agentów-ai)
3. [Wzorce Orkiestracji Multi-Agent](#3-wzorce-orkiestracji-multi-agent)
4. [Delegacja Sub-Agentów](#4-delegacja-sub-agentów)
5. [Automatyzacja Workflow](#5-automatyzacja-workflow)
6. [Optymalizacja Kosztów](#6-optymalizacja-kosztów)
7. [Stack Technologiczny](#7-stack-technologiczny)
8. [Implementacja w Praktyce](#8-implementacja-w-praktyce)
9. [Typowe Błędy](#9-typowe-błędy)
10. [Hierarchia Priorytetów](#10-hierarchia-priorytetów)

---

## 1. FILOZOFIA PROTOKOŁU

### 1.1 Podstawowa Zasada
> "Jeden agent zbyt wieloma odpowiedzialnościami staje się 'Jack of all trades, master of none'. Specjalizacja = niezawodność." — Azure AI Patterns

Protokół opiera się na **modularnej architekturze multi-agent**. Nie budujemy monolitycznych agentów — tworzymy specjalizowane jednostki, które razem tworzą system bardziej niezawodny niż pojedynczy super-agent.

### 1.2 Dlaczego Multi-Agent?

| Aspekt | Pojedynczy Agent | System Multi-Agent |
|--------|------------------|-------------------|
| **Złożoność** | Rosnąca z każdym narzędziem | Rozproszona na agentach |
| **Debugowanie** | Trudne (gdzie jest błąd?) | Łatwe (izolowany agent) |
| **Skalowalność** | Ograniczona | Elastyczna (dodaj agenta) |
| **Optymalizacja** | Jedna konfiguracja dla wszystkiego | Każdy agent ma optymalny model |
| **Koszt** | Stały (najdroższy model) | Dynamiczny (dopasowany do zadania) |

### 1.3 Zasada 80/20 w Agentach AI

**20% wysiłku daje 80% rezultatów:**
- Dobry prompt systemowy
- Właściwy model dla zadania
- Podstawowa orkiestracja
- Monitoring kosztów

**Ostatnie 20% wymaga:**
- Zaawansowanej delegacji
- Kompleksowej obsługi błędów
- Multi-agent collaboration
- Enterprise governance

---

## 2. ARCHITEKTURA AGENTÓW AI

### 2.1 Anatomia Agenta

Każdy agent składa się z 5 kluczowych elementów:

```
┌─────────────────────────────────────────┐
│           AGENT AI                      │
├─────────────────────────────────────────┤
│ 1. Model LLM (mózg)                     │
│    - Wybór modelu według zadania        │
│    - Temperature, max_tokens            │
│                                         │
│ 2. System Prompt (osobowość)            │
│    - Rola, ograniczenia, format wyjścia │
│                                         │
│ 3. Tools (narzędzia)                    │
│    - Funkcje, API, bazy danych          │
│                                         │
│ 4. Memory (pamięć)                      │
│    - Session state, RAG, history        │
│                                         │
│ 5. Orchestration (orkiestracja)         │
│    - Jak agent współpracuje z innymi    │
└─────────────────────────────────────────┘
```

### 2.2 Hierarchia Modeli

**Strategia "Right-Sizing":**

| Model | Zastosowanie | Przykład | Koszt względny |
|-------|-------------|----------|----------------|
| **Tier 1: Małe** | Klasyfikacja, ekstrakcja, proste Q&A | GPT-3.5, Claude Haiku, Gemini Flash | 1x (baseline) |
| **Tier 2: Średnie** | Kompleksowe analizy, generowanie kodu | GPT-4o, Claude Sonnet | 3-5x |
| **Tier 3: Duże** | Rozumowanie, planowanie, kreatywność | GPT-4.5, Claude Opus, o1 | 10-20x |

**Zasada:** 80% zadań obsłuż małym modelem. Tylko 20% wymaga największych.

### 2.3 Prompt Engineering - Minimal Effective Dose

> "Descriptive labels like 'Please find below the summary...' may be clear — but token-expensive." — Token Optimization Study

**Zoptymalizowany prompt:**
```
ZAMIAST:
"You are an expert data scientist. Given the following dataset and detailed 
instructions, please analyze correlations, generate graphs, and provide observations."

UŻYJ:
"Analyze correlations, visualize data, summarize key insights."
```

**Rezultat:** 84% redukcja kosztów tokenów przez usunięcie redundantnego formatowania.

---

## 3. WZORCE ORKIESTRACJI MULTI-AGENT

### 3.1 Pattern 1: Sequential (Linia Montażowa)

**Kiedy użyć:** Pipeline'y przetwarzania danych, przepływy z wyraźnymi zależnościami

**Struktura:**
```
Input → Agent A → Agent B → Agent C → Output
        (Parse)   (Extract) (Summarize)
```

**Przykład - Przetwarzanie Dokumentów:**
| Krok | Agent | Zadanie | Output Key |
|------|-------|---------|------------|
| 1 | ParserAgent | PDF → Tekst | `raw_text` |
| 2 | ExtractorAgent | Tekst → Struktura | `structured_data` |
| 3 | SummarizerAgent | Struktura → Podsumowanie | `final_summary` |

**Zalety:** Proste do debugowania, deterministyczne  
**Wady:** Brak równoległości, wolniejsze

### 3.2 Pattern 2: Concurrent (Fan-Out/Fan-In)

**Kiedy użyć:** Zadania niezależne, przeglądy kodu, analizy wielowymiarowe

**Struktura:**
```
Input → Agent A (Security) ─┐
        Agent B (Style)    ─┼→ Synthesizer → Output
        Agent C (Performance)─┘
```

**Przykład - Code Review:**
```python
# Parallel Agents
security_scanner = LlmAgent(
    name="SecurityAuditor",
    instruction="Check for vulnerabilities.",
    output_key="security_report"
)

style_checker = LlmAgent(
    name="StyleEnforcer", 
    instruction="Check PEP8 compliance.",
    output_key="style_report"
)

# Synthesizer
pr_summarizer = LlmAgent(
    name="PRSummarizer",
    instruction="Consolidate reports into one review."
)
```

**Zalety:** Szybsze (równoległość), różne perspektywy  
**Wady:** Złożona agregacja wyników, race conditions na shared state

### 3.3 Pattern 3: Coordinator/Dispatcher (Koncjer)

**Kiedy użyć:** Routing intencji, customer service, złożone systemy z wieloma ekspertami

**Struktura:**
```
User Request → Coordinator Agent → Billing Specialist
                                → Tech Support  
                                → Sales Agent
```

**Implementacja:**
```python
coordinator = LlmAgent(
    name="CoordinatorAgent",
    instruction="Analyze user intent. Route billing to Billing, tech to TechSupport.",
    sub_agents=[billing_specialist, tech_support, sales_agent]
)
```

**Klucz:** Sub-agenci mają `description` — coordinator wybiera na podstawie opisu.

### 3.4 Pattern 4: Hierarchical Decomposition (Rosyjska Matrioszka)

**Kiedy użyć:** Złożone zadania wymagające dekompozycji, zadania przekraczające context window

**Struktura:**
```
ReportWriter (L1)
    └── ResearchAssistant (L2)
            ├── WebSearchAgent (L3)
            └── SummarizerAgent (L3)
```

**Zasada:** Parent agent deleguje część zadania i czeka na wynik, aby kontynuować.

### 3.5 Pattern 5: Group Chat (Rada Agentów)

**Kiedy użyć:** Burza mózgów, iteracyjne doskonalenie, decyzje kworum

**Mechanizm:** Agenci wymieniają się wiadomościami w pętli do osiągnięcia konsensusu.

---

## 4. DELEGACJA SUB-AGENTÓW

### 4.1 Agent-as-a-Tool Pattern

Najefektywniejszy sposób implementacji sub-agentów — traktuj je jak narzędzia.

**Dlaczego to działa:**
- Redukcja context growth (kontekst sub-agenta nie zalewa głównego)
- Możliwość użycia tańszego modelu dla prostych zadań
- Izolacja błędów

**Implementacja (pseudokod):**
```kotlin
fun createFindAgentTool(): Tool<*, *> {
    return AIAgentService
        .fromAgent(findAgent)
        .createAgentTool<String, String>(
            agentName = "__find_in_codebase_agent__",
            agentDescription = """
                Użyj gdy potrzebujesz znaleźć kod w bazie.
                Podaj CO szukasz i DLACZEGO to ważne.
            """,
            inputDescription = """
                Szczegółowy opis poszukiwanego kodu i kontekstu.
            """
        )
}
```

### 4.2 Strategia "Find Agent" - Case Study

**Problem:** Główny agent przegląda wiele plików, zapamiętując ślepe zaułki (dead ends)

**Rozwiązanie:** Delegacja wyszukiwania do dedykowanego sub-agenta

| Bez Sub-Agenta | Z Sub-Agentem |
|----------------|---------------|
| Cała historia wyszukiwania w kontekście | Tylko wynik znalezienia |
| Drogi model (GPT-4) przez cały czas | Tani model (GPT-4 Mini) dla wyszukiwania |
| Kontekst zalewa istotne informacje | Skompresowana historia |

**Rezultat:** Redukcja kosztów + poprawa wydajności

### 4.3 Zasady Delegacji

**DELEGUJ gdy:**
- Zadanie jest wąsko zdefiniowane (search, parse, classify)
- Możesz użyć tańszego modelu
- Chcesz ograniczyć wzrost kontekstu
- Potrzebujesz izolacji błędów

**NIE DELEGUJ gdy:**
- Wymagana jest głęboka współpraca (użyj Group Chat)
- Zadanie jest trywialne (prosta funkcja wystarczy)
- Overhead orkiestracji przewyższa korzyści

---

## 5. AUTOMATYZACJA WORKFLOW

### 5.1 N8N vs Make.com vs Custom Code

| Narzędzie | Najlepsze dla | Zalety | Wady |
|-----------|--------------|--------|------|
| **n8n** | Self-hosted, HIPAA/GDPR | Open-source, lokalna instancja, 400+ integracji | Wymaga utrzymania |
| **Make.com** | Szybkie MVP, małe zespoły | UI/UX, łatwe startowanie | Drogi przy skali, vendor lock-in |
| **Temporal** | Enterprise, critical workflows | Trwałość, replay, scalability | Wymaga kodowania |
| **Airflow** | Data pipelines, ML ops | Mature, programowalne | Steep learning curve |

**Rekomendacja:**
- Start: n8n (self-hosted) lub Make.com
- Skala: Temporal lub custom z orkiestracją

### 5.2 Event-Driven Agent Workflows

**Architektura:**
```
Trigger (Webhook/Schedule/Cron)
    ↓
Event Bus (Redis/RabbitMQ/SQS)
    ↓
Agent Workers (scaling)
    ↓
Results Store (DB/Cache)
    ↓
Notifications/Callbacks
```

**Zalety:**
- Agenci skalują się niezależnie
- Odporność na awarie (retry logic)
- Możliwość mixu LLM + traditional processing

### 5.3 Human-in-the-Loop

**Kiedy włączyć człowieka:**
- Decyzje o wysokiej wartości ($$$)
- Dane wrażliwe (PII, HIPAA)
- Confidence score < threshold
- Edge cases nieobsługiwane automatycznie

**Implementacja:**
```python
if confidence < 0.7:
    send_to_human_review(task_id, context)
    await human_approval()
else:
    execute_automatically()
```

---

## 6. OPTYMALIZACJA KOSZTÓW

### 6.1 Główne Drivery Kosztów

| Czynnik | Wpływ | Strategia optymalizacji |
|---------|-------|------------------------|
| **Tokeny Input** | 60-70% kosztu | Krótsze prompty, RAG, prompt caching |
| **Tokeny Output** | 30-40% kosztu | Limit max_tokens, format constraints |
| **Wybór modelu** | 10-50x różnica | Model routing, tiered approach |
| **Częstotliwość** | Multiplikator | Caching, batch processing |
| **Latency** | Premium pricing | Async processing, queue |

### 6.2 Strategie Redukcji Kosztów

#### A. Prompt Optimization

**Przed:**
```
You are a helpful assistant. Please analyze the following text carefully 
and provide a detailed summary including main points, supporting evidence, 
and conclusions. Make sure to be thorough and comprehensive.
```
**Tokeny:** ~45

**Po:**
```
Summarize: {text}
Format: Bullet points
Max length: 3 bullets
```
**Tokeny:** ~12 (73% redukcja)

#### B. Model Routing (LLM Gateway)

**Logika routingu:**
```python
def route_request(task_type, complexity):
    if complexity == "simple" or task_type in ["classify", "extract"]:
        return "gpt-3.5-turbo"  # 10x cheaper
    elif complexity == "medium":
        return "gpt-4o-mini"     # 3x cheaper
    else:
        return "gpt-4"           # Full power
```

**Case Study:** Telecom enterprise — 42% redukcja kosztów przez dynamic routing.

#### C. Caching Strategy

**Poziomy cache:**
1. **Exact Match Cache** — identyczne zapytania (Redis, 1h TTL)
2. **Semantic Cache** — podobne zapytania (embeddings + vector DB)
3. **Pre-computed Results** — FAQ, common queries

**Potencjalna oszczędność:** 20-40% dla repetitive workloads

#### D. Context Compression

**Techniki:**
- Summarization conversation history (keep last 5, summarize rest)
- RAG z relevant chunks (nie całe dokumenty)
- Selective context passing między agentami

**Rezultat:** Redukcja input tokens o 50-70%

### 6.3 Benchmarki Kosztów

**Typowy support chatbot (500k requestów/miesiąc):**

| Scenariusz | Koszt miesięczny |
|------------|------------------|
| GPT-4 everywhere | $15,000 |
| + Model routing | $9,000 (-40%) |
| + Caching (30% hit) | $6,300 (-58%) |
| + Prompt optimization | $4,500 (-70%) |

**Zasada:** Optymalizacja nie zmniejsza jakości — zwiększa efektywność.

---

## 7. STACK TECHNOLOGICZNY

### 7.1 Core Stack (Must-Have)

| Warstwa | Narzędzie | Alternatywy | Kiedy użyć |
|---------|-----------|-------------|------------|
| **LLM API** | OpenAI API | Anthropic, Google, Azure | Start, prototyping |
| **Framework** | LangChain | LlamaIndex, Haystack | Complex agents |
| **Orkiestracja** | n8n | Make.com, Temporal | Workflow automation |
| **Baza danych** | PostgreSQL | Supabase, Neon | Session state, logs |
| **Cache** | Redis | Memcached, KeyDB | Token caching, rate limiting |
| **Monitoring** | LangSmith | Langfuse, Helicone | Cost tracking, debugging |

### 7.2 Zaawansowany Stack

| Warstwa | Narzędzie | Cel |
|---------|-----------|-----|
| **Vector DB** | Pinecone / Weaviate | RAG, semantic cache |
| **LLM Gateway** | LiteLLM / Portkey | Unified API, cost control |
| **Observability** | OpenTelemetry + Grafana | Full tracing |
| **Deployment** | Docker + K8s | Scale to zero |
| **Queue** | Redis / SQS / RabbitMQ | Async processing |

### 7.3 Self-Hosted vs Cloud

| Scenariusz | Rekomendacja | Szacunkowy koszt miesięczny |
|------------|-------------|----------------------------|
| Startup / MVP | Cloud APIs (OpenAI) | $100-500 |
| Scale / Cost control | Self-hosted (Llama 3, Mistral) | $500-2000 (infra) |
| Enterprise / Privacy | Hybrid (sensitive on-prem, rest cloud) | $2000-10000 |
| High volume | Full self-hosted | Fixed vs variable cost |

---

## 8. IMPLEMENTACJA W PRAKTYCE

### 8.1 Startowy Template (Python)

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# 1. Definiujemy narzędzia
from my_tools import search_tool, calculator_tool

# 2. Konfiguracja promptu
system_prompt = """Jesteś pomocnym asystentem. 
Używaj narzędzi gdy potrzebujesz zewnętrznych danych.
Odpowiadaj zwięźle i konkretnie."""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# 3. Tworzymy agenta
llm = ChatOpenAI(model="gpt-4o-mini")  # Start z małym modelem
agent = create_openai_tools_agent(llm, [search_tool, calculator_tool], prompt)

# 4. Executor z obsługą błędów
agent_executor = AgentExecutor(
    agent=agent, 
    tools=[search_tool, calculator_tool],
    verbose=True,
    max_iterations=5,
    handle_parsing_errors=True
)
```

### 8.2 Multi-Agent Setup (ADK Pattern)

```python
from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent

# Definiujemy specjalistów
researcher = LlmAgent(
    name="Researcher",
    model="gemini-1.5-flash",
    instruction="Znajdź fakty na podany temat.",
    output_key="facts"
)

writer = LlmAgent(
    name="Writer",
    model="gemini-1.5-pro",
    instruction="Napisz artykuł używając: {facts}",
    output_key="article"
)

# Orkiestracja
pipeline = SequentialAgent(
    name="ContentPipeline",
    sub_agents=[researcher, writer]
)
```

### 8.3 Cost-Optimized Setup

```python
from langchain_core.runnables import RunnablePassthrough

# Router funkcji — wybiera model według zadania
def smart_router(input_data):
    task = classify_task(input_data)  # Lightweight classifier
    
    if task == "simple":
        return cheap_model
    elif task == "complex":
        return expensive_model
    else:
        return medium_model

# Chain z routingiem
chain = (
    {"input": RunnablePassthrough()}
    | smart_router
    | prompt
    | llm
    | parser
)
```

---

## 9. TYPOWE BŁĘDY

### 9.1 Błędy Architektoniczne

| Błąd | Rozwiązanie |
|------|-------------|
| Monolityczny super-agent | Podział na specjalistów |
| Jeden model dla wszystkiego | Model routing |
| Brak limitów iteracji | `max_iterations=5` |
| No error handling | Try/catch + fallback |
| Synchroniczne wywołania | Async + queue |

### 9.2 Błędy Kosztowe

| Błąd | Rozwiązanie |
|------|-------------|
| Pełna historia w każdym requeście | Context compression |
| GPT-4 dla prostych zadań | Tiered model strategy |
| Brak caching | Redis + semantic cache |
| Verbose system prompts | Concise prompt engineering |
| Brak monitoringu | LangSmith/Helicone |

### 9.3 Błędy Bezpieczeństwa

| Błąd | Rozwiązanie |
|------|-------------|
| Exposed API keys w kodzie | Environment variables |
| No rate limiting | Redis + middleware |
| Sensitive data w prompts | PII detection + masking |
| No audit logs | Structured logging |
| Prompt injection vulnerable | Input validation |

---

## 10. HIERARCHIA PRIORYTETÓW

### Piramida Gold AI Agents Protocol

```
                    ┌─────────────────┐
                    │  ENTERPRISE     │  ← Governance, compliance,
                    │  FEATURES       │    multi-region
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
│  ADVANCED       │  ← Multi-agent patterns,
                    │  ORKIESTRACJA   │    sub-agent delegation
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  COST CONTROL   │  ← Model routing, caching,
                    │  & MONITORING   │    token optimization
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  SOLID BASE     │  ← Good prompts, right model,
                    │  IMPLEMENTATION │    error handling, tools
                    └────────┬────────┘
                             │
    ┌────────────────────────▼────────────────────────┐
    │              CLEAR USE CASE                     │  ← 100% must-have
    │  (Co agent ma robić? Dla kogo? Jaka wartość?)   │
    └─────────────────────────────────────────────────┘
```

### Ścieżka Implementacji (12-tygodniowy plan)

| Tydzień | Fokus | Deliverable |
|---------|-------|-------------|
| 1-2 | Definicja problemu, wybór modelu | Working prototype |
| 3-4 | Prompt engineering, tools | Solid single-agent |
| 5-6 | Cost monitoring, caching | Baseline metrics |
| 7-8 | Multi-agent decomposition | 2-3 agents working |
| 9-10 | Orchestration, error handling | Production-ready |
| 11-12 | Governance, security, scale | Enterprise deploy |

---

## PODSUMOWANIE

**Gold AI Agents Protocol** to kompletny system budowy agentów AI:

1. **Specjalizacja** — dziel złożone zadania na dedykowanych agentów
2. **Delegacja** — używaj sub-agentów jako narzędzi dla izolacji i kosztów
3. **Orkiestracja** — wybieraj wzorzec dopasowany do przepływu danych
4. **Optymalizacja** — 80% zadań obsługuj małymi modelami
5. **Monitoring** — śledź koszty per task, nie tylko per API call

**Nie buduj największego agenta. Buduj najlepiej zorganizowany system.**

---

**Zasada końcowa:**
> "Progress > Perfection. Get a working agent first, then optimize." — Agent Development Best Practices

---

## 11. AKTUALIZACJA BATCH: X BOOKMARKS (2026-02-14 → 2026-02-22)

### Najważniejsze sygnały (samo mięso)

1. **Mission statement + role clarity** mocno korelują z jakością działania agentów.
   - Powtarzalny wzorzec: gdy agent ma jasny cel, jest mniej „chatbotowy”, bardziej operacyjny.

2. **Skills-first architecture** (manifest + dedykowane skille) to obecny standard high-leverage setupu.
   - Użyteczne zwłaszcza przy powtarzalnych workflowach: research, monitoring, content, automatyzacje.

3. **Memory protocol + compaction** wraca jako warunek skalowania.
   - Bez trwałej pamięci i regularnej kompaktacji kontekstu agent traci ciągłość i jakość decyzji.

4. **Multi-agent / nested subagents** są skuteczne, ale tylko przy mocnych guardrailach.
   - Klucz: limity kosztów, zakres odpowiedzialności i kontrola uprawnień.

5. **UI operacyjne > „fancy dashboard”**
   - Najbardziej praktyczne setupy mają prosty panel decyzji i minimalny friction w obsłudze.

### Co wdrażać u nas (operacyjnie)

- Trzymać **role-specific agent design** (bez „jednego agenta do wszystkiego”).
- Każdy powtarzalny proces zamieniać w **skill + checklistę jakości**.
- Utrzymywać **pamięć trwałą + przegląd błędów** jako stały rytm.
- Rozszerzać subagentów tylko tam, gdzie jest jasny zwrot czasu/kosztu.

### Linki źródłowe (batch AI)

- `memory/BOOKMARKS_AI_AGENTS_2026-02-14_to_2026-02-22.md`
- `memory/X_BOOKMARKS_CATEGORIZED_2026-02-14_to_2026-02-22.md`

---

*Dokument skompilowany z zakładek X/Twitter przez Aura/OpenClaw*  
*Źródła: @AlexFinn, @moritzkremb, @code_rams, Azure AI Patterns, Google ADK, AWS Best Practices*  
*Wszystkie protokoły są kompilacją wiedzy publicznej*
