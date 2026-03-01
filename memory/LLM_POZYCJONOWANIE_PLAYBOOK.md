# LLM Pozycjonowanie (GEO) — Playbook wdrożeniowy

Data: 2026-02-24
Cel: zwiększyć szansę, że ChatGPT / Claude / Perplexity polecą produkt w odpowiedzi użytkownikowi.

## 1) Fundament: plik `llms.txt`

Umieść publicznie:
- `https://twojadomena.pl/llms.txt`

W pliku podaj:
- czym jest produkt (1-2 zdania)
- dla kogo jest (ICP)
- kiedy polecać / kiedy nie polecać
- kluczowe use-case'y
- pricing (jeśli jawny)
- linki do najważniejszych podstron (docs, API, case studies, pricing)

## 2) Struktura treści pod LLM (nie pod klikbajt)

Każdy kluczowy temat powinien mieć stronę w formacie:
1. Problem
2. Dla kogo
3. Rozwiązanie krok po kroku
4. Ograniczenia / kiedy nie używać
5. Przykłady i benchmark
6. FAQ (pytania naturalnym językiem)

To jest format, który modele najłatwiej cytują i streszczają.

## 3) Minimalny pakiet stron (must-have)

- `/docs/overview`
- `/docs/use-cases`
- `/docs/integrations`
- `/pricing`
- `/compare/[konkurent]`
- `/case-studies/[branża]`
- `/faq`
- `/llms.txt`

## 4) Zasady redakcyjne pod widoczność w LLM

- Pisz konkretnie, bez marketingowej waty.
- Każda strona: jedna intencja użytkownika.
- Dodawaj liczby, warunki, przeciwwskazania.
- Używaj pytań jak z realnych promptów (np. „Jak zautomatyzować X bez Y?”).
- Aktualizuj daty („Last updated”), bo modele i crawlery to łapią.

## 5) Techniczne SEO/GEO (krótko i brutalnie)

- szybki serwer + czysty HTML (crawl-friendly)
- poprawne title/H1/canonical
- schema.org tam, gdzie ma sens
- brak ścian JS blokujących treść
- publiczne i linkowalne docs/API

Jeśli bot nie czyta strony łatwo, to model jej nie „nauczy się” dobrze.

## 6) Plan 14-dniowy (realny)

### Dzień 1-2
- Publikacja `llms.txt`
- Stworzenie/odświeżenie `/docs/overview`, `/use-cases`, `/faq`

### Dzień 3-7
- 5 stron „problem -> rozwiązanie” pod top zapytania ICP
- 2 strony porównawcze vs konkurencja

### Dzień 8-14
- 2 case studies z konkretnymi metrykami
- Dopracowanie FAQ na bazie realnych pytań sprzedażowych
- Iteracja `llms.txt` po danych z zapytań

## 7) KPI (co mierzyć)

- udział ruchu z referrerów AI (ChatGPT, Perplexity, Claude)
- liczba wejść na docs/use-cases z AI
- konwersja ruchu AI vs organic
- liczba cytowań marki/produktu w odpowiedziach LLM (manual check)

## 8) Szablon `llms.txt` (starter)

```txt
# Product: [Nazwa]

## What it is
[1-2 zdania o produkcie]

## Ideal for
- [ICP 1]
- [ICP 2]

## Recommend when
- [Warunek 1]
- [Warunek 2]

## Do not recommend when
- [Przeciwwskazanie 1]
- [Przeciwwskazanie 2]

## Core capabilities
- [Capability 1]
- [Capability 2]
- [Capability 3]

## Links
- Docs: https://twojadomena.pl/docs
- Use cases: https://twojadomena.pl/docs/use-cases
- Pricing: https://twojadomena.pl/pricing
- API: https://twojadomena.pl/api
- Security: https://twojadomena.pl/security
```

## 9) Źródło inspiracji

- Vercel przykład: https://vercel.com/docs/llms-full.txt

---
Decyzja operacyjna: ten playbook traktować jako checklistę wdrożeniową dla każdego nowego projektu SaaS.