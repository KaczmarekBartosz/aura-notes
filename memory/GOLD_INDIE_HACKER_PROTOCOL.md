# GOLD INDIE HACKER PROTOCOL
## Kompletny system budowy solo-SaaS od zera do $10k+/mies. (bez chaosu i bez iluzji)

**Wersja:** 1.0  
**Źródło:** Kompilacja zakładek X/Twitter (@pbteja1998, @mark_k, @kloss_xyz, @adriankuleszo)  
**Data kompilacji:** 2026-02-26

---

## SPIS TREŚCI

1. [Filozofia Indie Hackera 2026](#1-filozofia-indie-hackera-2026)
2. [Protokół Wyboru Problemu i NISZY](#2-protokół-wyboru-problemu-i-niszy)
3. [Protokół Budowy MVP (14 dni)](#3-protokół-budowy-mvp-14-dni)
4. [Protokół UX, który sprzedaje](#4-protokół-ux-który-sprzedaje)
5. [Protokół Monetyzacji i Pricingu](#5-protokół-monetyzacji-i-pricingu)
6. [Protokół Launchu (0 → pierwsi klienci)](#6-protokół-launchu-0--pierwsi-klienci)
7. [Protokół Skali ($1k → $10k MRR)](#7-protokół-skali-1k--10k-mrr)
8. [System Operacyjny Solo Foundera (mission control)](#8-system-operacyjny-solo-foundera-mission-control)
9. [Protokół Energii i Decyzji Foundera](#9-protokół-energii-i-decyzji-foundera)
10. [Checklisty operacyjne + typowe błędy](#10-checklisty-operacyjne--typowe-błędy)

---

## 1. FILOZOFIA INDIE HACKERA 2026

### 1.1 Zasada główna
Nie wygrywa „najlepszy produkt”. Wygrywa **najszybsza pętla: problem → rozwiązanie → płatna walidacja → poprawka**.

### 1.2 Co to znaczy „ship fast” naprawdę
- Nie: klepanie feature’ów przez 3 miesiące.
- Tak: publikacja brzydkiego, ale działającego rozwiązania w 7-14 dni.
- Nie: „najpierw pełny stack, potem klienci”.
- Tak: „najpierw klient i płatność, potem architektura”.

### 1.3 5 brutalnych prawd
1. **Brak dystrybucji zabija najlepszy produkt.**
2. **Za niska cena = fałszywy PMF.**
3. **Za dużo opcji = mniej konwersji.**
4. **Brak codziennego rytmu sprzedaży = stagnacja.**
5. **Solo founder bez systemu = gaszenie pożarów, nie biznes.**

---

## 2. PROTOKÓŁ WYBORU PROBLEMU I NISZY

### 2.1 Filtr problemu (P0)
Problem jest „dobry”, jeśli spełnia min. 4/6:
- [ ] Powtarzalny (dzieje się co tydzień / codziennie)
- [ ] Kosztowny (czasowo albo finansowo)
- [ ] Mierzalny (da się pokazać ROI)
- [ ] Pilny (ludzie szukają obejść teraz)
- [ ] Wąski (jedna persona, jeden use-case)
- [ ] Monetyzowalny B2B lub PRO-sumer

### 2.2 Matryca niszy (scoring 1-5)
| Kryterium | Opis | Wynik |
|---|---|---|
| Ból | Jak mocno boli? | /5 |
| Gotowość do płacenia | Czy już płacą za coś podobnego? | /5 |
| Dostęp do klientów | Czy masz kanał dotarcia? | /5 |
| Konkurencja | Czy da się wejść z prostszą ofertą? | /5 |
| Szybkość MVP | Czy zrobisz MVP ≤14 dni? | /5 |

**Próg wejścia:** minimum 18/25.

### 2.3 10 rozmów walidacyjnych (must)
Przed kodowaniem zbierz 10 rozmów i pytaj:
1. Co dziś robisz ręcznie?
2. Co najbardziej wkurza?
3. Ile to kosztuje czasu/tydzień?
4. Jak to dziś obchodzisz?
5. Za co zapłaciłbyś, żeby ten problem zniknął?

**Stop condition:** jeśli po 10 rozmowach nikt nie mówi „to bym kupił”, zmień niszę, nie kolor przycisku.

---

## 3. PROTOKÓŁ BUDOWY MVP (14 DNI)

### 3.1 Zakres MVP = 1 obietnica
MVP ma dowieźć jedną rzecz:
> „W X minut redukuję Y problem o Z%”.

### 3.2 Plan 14 dni
**D1-D2:** mapa flow + fake door + landing  
**D3-D7:** core funkcja (bez bajerów)  
**D8-D9:** płatność + onboarding + logging błędów  
**D10-D11:** testy z 5 użytkownikami  
**D12:** poprawki krytyczne  
**D13:** publikacja + posty + outreach  
**D14:** analiza i decyzja: iterować / pivot

### 3.3 Definicja DONE dla MVP
- [ ] Użytkownik może wejść, zrozumieć i wykonać core task bez tutoriala
- [ ] Jest aktywna płatność (Stripe/Lemon)
- [ ] Jest analytics (minimum: wejścia, aktywacje, płatności)
- [ ] Jest onboarding (max 3 kroki)
- [ ] Jest support email + FAQ

---

## 4. PROTOKÓŁ UX, KTÓRY SPRZEDAJE

Inspiracja z praktyki produktowej: „ma wyglądać jak narzędzie do pieniędzy, nie terminal dla tradera”.

### 4.1 Zasady UI/UX dla SaaS
1. **Pierwszy ekran = stan + 1 akcja.**
2. **Mniej opcji, więcej domyślnych decyzji.**
3. **Liczby podawaj w języku klienta (np. USD + jednostka domenowa).**
4. **CTA tylko jedno główne na ekran.**
5. **Font i hierarchy muszą być nudne i czytelne, nie „kreatywne”.**

### 4.2 Ekran główny (szablon)
- Top: wynik klienta (np. „Zaoszczędzone 7.3h w tym tygodniu”)
- Middle: lista 3 najważniejszych elementów
- Bottom: jeden primary CTA

### 4.3 Onboarding 3-ekranowy
1. Co robimy
2. Co importujemy / ustawiamy
3. Pierwszy szybki wynik (<60 sek)

Jeśli onboarding trwa >3 minuty, to nie onboarding — to kara.

---

## 5. PROTOKÓŁ MONETYZACJI I PRICINGU

### 5.1 Minimalny model cenowy
3 plany:
- **Starter** (niski próg)
- **Pro** (domyślnie polecany)
- **Scale/Team** (anchor dla percepcji wartości)

### 5.2 Reguły pricingu
- Nie startuj od „freemium forever”.
- Darmowy okres próbny 7-14 dni > darmowy plan bez końca.
- Cena ma boleć trochę — inaczej produkt wygląda na zabawkę.
- Podnoś ceny nowym klientom co 20-30 aktywnych użytkowników.

### 5.3 Wskaźniki pricingowe
- Trial→Paid < 10% = problem z wartością lub onboardingiem
- Churn miesięczny > 8% = obietnica nie dowożona
- ARPU rośnie, a konwersja stoi = jesteś na dobrej ścieżce B2B

---

## 6. PROTOKÓŁ LAUNCHU (0 → PIERWSI KLIENCI)

### 6.1 Launch Stack (7 dni)
- X/Twitter: 1 publiczny wątek „build in public”
- DM outreach: 30-50 precyzyjnych wiadomości
- Landing z jasnym CTA
- Demo video 60-90 sekund
- Formularz waitlist / early access

### 6.2 Format posta launchowego
1. Problem (konkretny)
2. Dla kogo
3. Co robi produkt
4. Dowód (gif/video/liczby)
5. CTA (link + cena/test)

### 6.3 Outreach template (PL)
„Cześć [imię], buduję [produkt] dla [persona]. Pomaga skrócić [problem] z [stan A] do [stan B]. Szukam 5 osób do testu (z onboardingiem 1:1). Jeśli chcesz, podeślę 2-min demo.”

---

## 7. PROTOKÓŁ SKALI ($1k → $10k MRR)

### 7.1 Etap 1: $0 → $1k MRR
Cel: dowód, że ktoś płaci regularnie.
- 5-15 płacących klientów
- ręczny onboarding
- ręczny support
- codzienny kontakt z użytkownikami

### 7.2 Etap 2: $1k → $3k MRR
Cel: powtarzalny kanał acquisition.
- 1 główny kanał + 1 zapasowy
- tygodniowy rytm publikacji contentu
- 1 automatyzacja operacyjna / tydzień

### 7.3 Etap 3: $3k → $10k MRR
Cel: system, nie hero mode.
- playbook sprzedaży
- playbook onboardingu
- playbook utrzymania
- podniesienie cen + segmentacja klientów

### 7.4 KPI tygodniowe (must)
- Nowe leady
- Demo / rozmowy
- Aktywacje
- Płatności
- Churn
- NPS lub prosty „czy poleciłbyś dalej?”

---

## 8. SYSTEM OPERACYJNY SOLO FOUNDERA (MISSION CONTROL)

Inspiracje źródłowe: „Mission Control / Squad HQ / Jarvis” jako warstwa operacyjna.

### 8.1 Minimalny Mission Control
Musisz widzieć codziennie 1 ekran z:
- Pipeline sprzedaży
- Najważniejsze zadania P0
- Przychód i churn
- Co utknęło (blockery)
- Co dziś musi być wysłane

### 8.2 Architektura operacyjna
- **Brain:** cele i kontekst
- **Muscles:** routing zadań (co automatyzować, co ręcznie)
- **DNA:** reguły działania
- **Heartbeat:** regularny przegląd i korekta

### 8.3 Cotygodniowy rytm operatora
**Pon:** KPI + decyzje cenowe  
**Wt:** produkt + bugfix + UX  
**Śr:** dystrybucja + content  
**Czw:** sprzedaż + follow-up  
**Pt:** retro + plan tygodnia  
**Sob/Nd:** lekki research / odpoczynek strategiczny

### 8.4 Zasada „AI generuje, człowiek domyka”
Jeśli system produkuje dużo zadań i pomysłów, ale nie rośnie revenue, masz klasyczny bottleneck egzekucji.
Rozwiązanie: 
- ogranicz backlog do 3 priorytetów tygodniowo,
- każdemu priorytetowi przypisz deadline i metric,
- resztę zamrażasz.

---

## 9. PROTOKÓŁ ENERGII I DECYZJI FOUNDERA

Nawet najlepsza strategia pada, jeśli founder działa jak zombie.

### 9.1 Protokół kognitywny (roboczy)
- Deep work: 2 bloki po 90 min dziennie
- Zero Slack/Telegram podczas bloku
- Najtrudniejsze decyzje przed 13:00
- Review dnia: 10 min (co działało / co wyciąć)

### 9.2 Higiena decyzji
- Max 3 cele dzienne
- Max 1 kluczowa decyzja strategiczna dziennie
- „Nie” dla wszystkiego, co nie wspiera aktualnej tezy wzrostu

### 9.3 Wydajność mentalna (ostrożnie, eksperymentalnie)
W źródłach pojawia się temat wyższych dawek kreatyny pod pracę umysłową. Traktuj to jako eksperyment z ostrożnością i monitorowaniem reakcji organizmu. Fundamentem i tak są: sen, ruch, nawodnienie, brak chaosu poznawczego.

---

## 10. CHECKLISTY OPERACYJNE + TYPOWE BŁĘDY

### 10.1 Daily Checklist (Founder)
- [ ] 1 metryka główna dnia
- [ ] 1 działanie sprzedażowe
- [ ] 1 działanie produktowe
- [ ] 1 kontakt z użytkownikiem
- [ ] 1 publikacja / dystrybucja (nawet krótka)

### 10.2 Weekly Checklist
- [ ] Przegląd KPI
- [ ] Analiza churn i powodów odpływu
- [ ] 3 rozmowy z klientami
- [ ] 1 podniesienie jakości onboardingu
- [ ] 1 usprawnienie automatyzacyjne

### 10.3 Najczęstsze błędy
| Błąd | Efekt | Antidotum |
|---|---|---|
| Budowanie bez rozmów | Produkt bez rynku | 10 rozmów przed kodem |
| Za dużo feature’ów | Brak jasnej wartości | 1 obietnica MVP |
| Za tanio | Niska jakość leadów | Podnieś cenę i filtruj |
| Brak rytmu dystrybucji | Zero pipeline | Stały weekly launch rhythm |
| Chaos operacyjny | Burnout + brak domknięć | Mission Control + 3 priorytety |

---

## HIERARCHIA PRIORYTETÓW (INDIE HACKER PYRAMID)

```
                    ┌─────────────────┐
                    │   AUTOMATYZACJA │  ← 5%
                    │   I AGENTY      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   DESIGN/UX     │  ← 10%
                    │   (konwersja)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   MONETYZACJA   │  ← 20%
                    │   (pricing)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  DYSTRYBUCJA    │  ← 25%
                    │  (ruch i leady) │
                    └────────┬────────┘
                             │
           ┌─────────────────▼─────────────────┐
           │            PRODUKT                 │  ← 40%
           │      (rozwiązuje 1 ból dobrze)     │
           └─────────────────┬─────────────────┘
                             │
    ┌────────────────────────▼────────────────────────┐
    │            EGZEKUCJA + KONSYSTENCJA             │  ← 100%
    │      (codzienna sprzedaż + shipping + feedback) │
    └─────────────────────────────────────────────────┘
```

---

## PODSUMOWANIE

**Gold Indie Hacker Protocol** to prosty, brutalnie praktyczny system:

1. Wybierz problem, który boli i za który ludzie płacą.
2. Zbuduj MVP w 14 dni z jedną obietnicą.
3. Uruchom dystrybucję od dnia 1.
4. Ustal pricing, który filtruje i buduje zdrowy biznes.
5. Pracuj w rytmie operacyjnym, nie w chaosie.
6. Skaluj przez system, nie przez więcej godzin.

**Jedna zasada końcowa:**
> Nie potrzebujesz „większej motywacji”. Potrzebujesz krótszej pętli decyzja → publikacja → płatny feedback.

---

*Dokument skompilowany z zakładek X/Twitter przez Aura/OpenClaw*  
*Materiał ma charakter operacyjno-edukacyjny; decyzje biznesowe podejmuj na podstawie własnych danych*