---
title: "AEO dla e-commerce — 7-warstwowy playbook (analiza zakładki X)"
subcategory: "seo"
category: "growth-marketing"
tags: ["marketing", "growth", "claude"]
type: "note"
created: "2026-02-25"
updated: "2026-02-25"
source: "manual"
ai_generated: false
---

# AEO dla e-commerce — 7-warstwowy playbook (analiza zakładki X)

**Data analizy:** 2026-02-25 (UTC)  
**Źródło:** Nate.Google (@Nate_Google_)  
**Link:** https://x.com/Nate_Google_/status/2026338035458056265?s=46  
**Typ:** long-form thread / article (lead magnet)

---

## 1) Executive summary (co autor twierdzi)

Autor opisuje case marki suplementów, która po wdrożeniu AEO (Answer Engine Optimization) miała przejść z ~0 do ~400k USD/mies. przychodu z ruchu AI (ChatGPT/Perplexity/Gemini/Claude), przy wyższej konwersji niż klasyczny organic z Google.

Core teza:
- nie walczysz o „pozycję #1 w Google”,
- walczysz o bycie **odpowiedzią** modeli AI.

---

## 2) 7 warstw strategii (przepis z posta)

### Warstwa 1 — Answer Intent Map (mapa pytań do AI)
- Zbiór realnych pytań zakupowych wpisywanych do ChatGPT/Perplexity/Claude.
- Dla każdego pytania: kto jest polecany, jakim językiem, z jakich źródeł model korzysta.

**Wniosek praktyczny:** to nowy research konkurencji + mapa intencji wysokiego zamiaru zakupowego.

### Warstwa 2 — Answer Hub
- Dedykowana strona typu: `/guides/best-[kategoria]-[year]`.
- Struktura: TL;DR, ranking 5-7 produktów (z konkurencją), tabela porównawcza, FAQ, cytowane źródła, CTA.

**Wniosek praktyczny:** AI chętniej cytuje treść „quasi-neutralną” niż klasyczny PDP sprzedażowy.

### Warstwa 3 — Brand Facts page
- Strona z faktami o marce (styl wiki): founded, certyfikaty, top SKU, polityki, SLA, contact.

**Wniosek praktyczny:** redukcja „niepewności modelu” przy rekomendacji marki.

### Warstwa 4 — `/.well-known/brand-facts.json`
- Maszynowo czytelny JSON z najważniejszymi faktami.

**Wniosek praktyczny:** ułatwia parserom/agentom ekstrakcję bez zgadywania i scrapingu DOM.

### Warstwa 5 — Schema markup
- Answer Hub: `ItemList` + `FAQPage`.
- Brand Facts: `Organization`.
- PDP: `Product` + rating/reviews/price/availability + identyfikatory.

**Wniosek praktyczny:** zwiększa spójność danych między stroną, feedem i tym, co model może zaciągnąć.

### Warstwa 6 — Third-party citations
- Zewnętrzne wzmianki/rekomendacje (review sites, Reddit, Quora, media, profile danych).

**Wniosek praktyczny:** modele wolą marki „potwierdzone” poza własną domeną.

### Warstwa 7 — GPT Shopping / Merchant Center readiness
- Identyfikatory produktów (GTIN/MPN+brand), pełne atrybuty, feed health, review mapping.

**Wniosek praktyczny:** bez porządnego feedu i identyfikatorów możesz być niewidoczny w shoppingowych powierzchniach AI.

---

## 3) Ocena wiarygodności (brutalnie)

### Co jest mocne
- Sam framework jest sensowny i zgodny z kierunkiem GEO/AEO.
- Akcent na strukturę danych, porównania, FAQ i external validation — bardzo trafny.

### Co jest marketingowym overclaimem
- Liczby typu „$400k/mies.” i „4.4x conversion” są bez metodologii, bez pełnego attribution modelu, bez dowodu kauzalności.
- To case sprzedażowy (lead gen), nie publikacja badawcza.

**Ocena operacyjna:** traktować jako **dobry framework**, nie jako gwarantowany benchmark wyników.

---

## 4) Co przenosimy 1:1 do naszych wdrożeń

1. **Intent map na poziomie pytań**, nie samych keywordów.  
2. **Answer Hub per kategoria/use case** (z realnym porównaniem, nie propagandą).  
3. **Brand Facts + machine-readable facts** (`brand-facts.json`).  
4. **Schema sanity pass** na stronach komercyjnych.  
5. **Weekly maintenance loop (90 min)** i KPI pod ruch/konwersję AI.

---

## 5) 14-dniowy plan wdrożenia (wersja compact)

### Dni 1-2
- Zbudować Answer Intent Map (min. 40-60 pytań).
- Zrobić baseline: gdzie marka jest rekomendowana dziś.

### Dni 3-5
- Wdrożyć 1 Answer Hub dla najważniejszej kategorii.
- Dodać sekcję FAQ + tabela porównawcza + źródła.

### Dni 6-7
- Wdrożyć Brand Facts page.
- Wystawić `/.well-known/brand-facts.json`.

### Dni 8-10
- Uzupełnić schema (`Product`, `ItemList`, `FAQPage`, `Organization`).
- Spiąć spójność danych: cena, review count, availability, identyfikatory.

### Dni 11-14
- Uruchomić citation sprint: review sites + community (Reddit/Quora) + evidence assets.
- Ustawić cotygodniowy monitoring promptów + KPI dashboard.

---

## 6) KPI (minimalny zestaw)

- % targetowych pytań AI, w których marka jest rekomendowana.
- Pozycja rekomendacji (top1/top3/nieobecna).
- Ruch z referrerów AI.
- Konwersja ruchu AI vs organic vs paid.
- LTV i subscribe-rate dla cohort AI-referred.

---

## 7) Red flags / ryzyka

- „Neutralny” content, który jest de facto reklamą, może obniżać zaufanie (u użytkownika i modelu).
- Niespójne dane między PDP, schema i feedem rozwalają widoczność.
- Brak procesu aktualizacji (dated facts) powoduje dryf jakości rekomendacji.

---

## 8) Decyzja operacyjna

Ten materiał kwalifikuje się jako **„przepis strategiczny” do bazy**.  
Status: **zarchiwizowano i rozpisano do wdrożenia**.

