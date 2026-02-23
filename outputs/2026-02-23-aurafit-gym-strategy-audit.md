# Aurafit — Kompleksowy audit aplikacji + strategia monetyzacji i integracji dla sieci siłowni

**Data:** 2026-02-23  
**Autor:** Aura  
**Cel:** przygotowanie pełnej strategii biznesowo-produktowej dla pivotu z B2C do B2B2C (integracja z siecią siłowni, np. ST8 Gym)

---

## 1) Executive summary (wersja bez lania wody)

Aurafit **już dziś** ma mocny produkt pod użytkownika końcowego: trening, dieta, AI, gamifikacja, progres, płatności i sensowną architekturę.  
Największa szansa biznesowa: przejście na model **B2B2C dla klubów fitness** (siłownia kupuje dostęp dla członków), bo wtedy koszt pozyskania usera dramatycznie spada, a dystrybucja jest natychmiastowa.

### Najważniejsze wnioski

1. **Produktowo jesteś gotowy na pilot komercyjny** (nie tylko demo).  
2. **Największa luka to brak multi-tenantu klubowego** (organizacje, oddziały, role, seaty, umowy).  
3. **Monetyzacja B2C działa, ale B2B będzie bardziej skalowalne lokalnie** (1 kontrakt = dziesiątki/setki użytkowników).  
4. **Najlepszy ruch: 2-etapowy rollout**: płatny pilot 6–8 tygodni + kontrakt roczny po KPI.

---

## 2) Zakres audytu (co zostało sprawdzone)

Przeanalizowano:

- kod i strukturę projektu `aplikacja-fitness` (Next.js App Router + Server Actions),
- kluczowe moduły akcji (`app/actions/*`),
- warstwę danych i migracje Supabase (`supabase/migrations/*`),
- moduł subskrypcji Stripe,
- dokumentację funkcjonalności i architektury,
- stronę publiczną `aurafit.pl`,
- dane rynkowe dostępne publicznie (fitness PL + retention context).

---

## 3) Stan aplikacji — realna dojrzałość produktu

## 3.1 Co działa bardzo dobrze (assety sprzedażowe)

### A) Core wellness app

- onboarding profilujący usera,
- dashboard z Recovery Score i Daily Brief,
- treningi (plany, sesje, sety, historia, PR-y),
- żywienie (logowanie + skaner + makro),
- filary: woda/sen/mental/suplementy,
- AI Coach + context-aware odpowiedzi.

**Wniosek:** to nie jest „MVP z landingiem”, tylko działająca aplikacja z szerokim zakresem funkcji.

### B) Silnik treningowy

- biblioteka ćwiczeń i planów,
- Play Mode (timer, RPE, flow sesji),
- mechaniki progresu i gamifikacji,
- możliwość rozbudowy pod programy klubowe i trenerów.

**Wniosek:** mocna baza pod retencję i regularność ćwiczeń — kluczowe dla właściciela siłowni.

### C) Architektura techniczna

- Next.js + Server Actions,
- Supabase (RLS, auth, storage),
- separacja walidacji,
- gotowa integracja płatności Stripe,
- gotowość do iteracyjnego wdrażania nowych modułów.

**Wniosek:** fundament pod skalowanie jest sensowny; nie trzeba robić replatformingu.

---

## 3.2 Co jest słabe / niedokończone (trzeba naprawić przed enterprise)

1. **Brak modelu multi-tenant gym**  
   Dziś appka jest user-centric, nie organization-centric.

2. **Social feed jest częściowo mockowany (UI-first)**  
   Widok social ma statyczne dane i nie jest jeszcze pełnym systemem społecznościowym na produkcję.

3. **Health integration ma elementy symulacyjne na webie**  
   Dokumentacja i kod wskazują, że pełna synchronizacja Apple Health / Google Health Connect wymaga warstwy natywnej.

4. **Niespójność walidacji `training_location`**  
   W migracjach uproszczono opcje, a walidacja dalej dopuszcza starszy wariant — potencjalny generator błędów danych.

5. **Autopilot ma TODO i brak pełnego delivery orchestration**  
   Są hooki i logika, ale część kanałów/flow wymaga domknięcia produkcyjnego.

---

## 4) Rynek — czy pivot do siłowni ma sens?

Krótko: **tak, ma sens**.

### Sygnały rynkowe (publiczne)

- Polska branża fitness wg cytowanych danych branżowych: ok. **3,1 mln członków / ~2760 klubów**.  
- Wskazywany jest dalszy potencjał wzrostu (szczególnie miasta mniejsze/średnie).  
- Operatorzy szukają narzędzi pod retencję, zaangażowanie i upsell usług.

### Sygnały behawioralne (retencja członków)

W materiałach branżowych regularnie powraca ten sam problem:

- wysoki odpływ nowych członków w pierwszych 30–90 dniach,
- brak planu i prowadzenia po starcie,
- brak społecznego „zakotwiczenia” członka.

To jest dokładnie obszar, gdzie Aurafit ma przewagi (onboarding, AI guidance, planowanie treningu, follow-up, gamifikacja, wyzwania).

---

## 5) Wszystkie kluczowe zalety Aurafit dla właściciela siłowni

Poniżej lista „językiem biznesu klubu”, nie „językiem aplikacji”.

## 5.1 Retencja i LTV

1. **Lepszy onboarding członka**  
   Członek od 1 dnia dostaje cel + plan + guidance → mniejsze ryzyko porzucenia.

2. **Mniej „zagubionych” nowych osób**  
   Aplikacja mówi co robić dalej, zamiast zostawiać usera samego na sali.

3. **Codzienny kontakt poza klubem**  
   Appka utrzymuje relację między wizytami (to klucz do retencji).

4. **Widoczny progres = mniej rezygnacji**  
   Jeśli user widzi postęp, trudniej mu anulować członkostwo.

## 5.2 Przychód i marża

5. **Większa frekwencja aktywnych członków**  
   Aktywny członek to dłuższa subskrypcja i wyższa wartość życiowa.

6. **Upsell usług premium**  
   Trener personalny, plan premium, wyzwania, konsultacje żywieniowe.

7. **Nowy produkt cyfrowy klubu**  
   Klub nie sprzedaje tylko „dostępu do maszyn”, ale „program wyników + coach”.

8. **Lepsza obrona przed wojną cenową**  
   Gdy konkurencja ścina ceny, Ty bronisz się wartością i doświadczeniem.

## 5.3 Operacje i zespół

9. **Mniej ręcznej pracy trenerów na starcie**  
   Standaryzowany onboarding i podstawowe prowadzenie robi appka.

10. **Lepsza widoczność danych dla managera**  
   Kto aktywny, kto „gaśnie”, które programy działają.

11. **Automatyczne rytmy komunikacji**  
   Follow-upy, przypomnienia, briefy — mniej chaosu operacyjnego.

12. **Skalowanie know-how klubu**  
   Nawet słabszy trener może pracować w lepszym standardzie dzięki gotowym flow.

## 5.4 Marketing i marka

13. **Wyższa postrzegana nowoczesność klubu**  
   Klub „z AI i personalizacją” wygrywa uwagę.

14. **Lepsze social proof przez wyniki członków**  
   Wyzwania, streaki i progres dostarczają treści do komunikacji marketingowej.

15. **Strukturalna przewaga lokalna**  
   W miastach średniej wielkości to może być wyraźny differentiator.

---

## 6) Strategia monetyzacji (docelowa)

Rekomendowany model: **B2B2C hybrid**.

## 6.1 Oferta dla klubu (B2B)

### Składniki ceny

1. **Setup fee** (wdrożenie + branding + konfiguracja): 4 000 – 15 000 PLN jednorazowo  
2. **Platform fee** (dostęp organizacyjny): 1 500 – 6 000 PLN / miesiąc  
3. **Per active member**: 8 – 25 PLN / aktywnego użytkownika / miesiąc

### Pakiety

- **Start** — 1 klub, podstawowe KPI, onboarding, trening, wyzwania  
- **Pro** — automatyzacje, segmentacja, coaching workflows  
- **Network** — multi-branch, benchmark oddziałów, centralne zarządzanie

## 6.2 Dodatkowe strumienie przychodu

- wdrożenia per oddział,
- „success fee” za KPI (np. redukcja churn),
- marketplace planów/programów,
- moduły premium dla trenerów,
- white-label i opłata za brand.

---

## 7) Strategia wejścia do ST8 Gym (praktyczna)

## 7.1 Oferta pilota (6–8 tygodni)

**Cel pilota:** udowodnić wpływ na retencję i aktywację nowych członków.

### Zakres pilota

- onboarding klubowy (z kodem i segmentem członka),
- plan startowy „pierwsze 30 dni”,
- logowanie treningów + streak + challenge klubowy,
- panel managera (minimum 6 KPI),
- tygodniowy raport dla właściciela.

### KPI pilota

- aktywacja 7-dniowa,
- aktywność 30-dniowa,
- średnia liczba wizyt/tydzień,
- odsetek nowych członków po 30/60/90 dniach,
- udział członków w challenge,
- NPS satysfakcji użytkowników aplikacji.

## 7.2 Warunek komercyjnego rolloutu

Po pilocie: decyzja „go/no-go” wg KPI + podpisanie umowy rocznej.

---

## 8) Docelowa architektura B2B (co trzeba dobudować)

## 8.1 Model danych (must-have)

Dodać encje:

- `organizations` (sieci),
- `clubs` (oddziały/lokalizacje),
- `club_memberships` (użytkownik ↔ klub + status),
- `staff_roles` (owner/manager/trainer/reception),
- `seat_licenses` (ile licencji, ile aktywnych),
- `club_programs` (programy przypisane do klubu),
- `club_events_challenges`.

## 8.2 Panel managera

Musi pokazać minimum:

- Active members,
- New member activation (D7/D30),
- Early churn risk,
- Class/workout completion,
- Challenge participation,
- ARPU i retention cohorts.

## 8.3 Integracje operacyjne (etapowo)

1. Import członków (CSV/API),
2. mapowanie membership tiers,
3. webhooki zdarzeń (join/cancel/freeze),
4. docelowo integracja z systemem klubowym.

---

## 9) Plan wdrożenia 90 dni

## Faza 1 (0–30 dni): pilot-ready

- model organizacji i klubu,
- role i uprawnienia,
- onboarding klubowy,
- dashboard managera v1,
- telemetry i KPI tracking.

## Faza 2 (31–60 dni): produkcja dla 1 sieci

- seat licensing,
- raportowanie i alerty churn-risk,
- challenge engine dla klubu,
- twarde SLA i operacyjna dokumentacja.

## Faza 3 (61–90 dni): skalowanie

- multi-branch,
- benchmark oddziałów,
- playbook sprzedażowy do kolejnych sieci,
- case study z pilota.

---

## 10) Ryzyka i jak je neutralizować

1. **Custom hell pod jednego klienta**  
   -> kontraktowo zamknąć scope pilota i roadmapę.

2. **Długi cykl decyzyjny w klubie**  
   -> krótkie piloty z KPI i szybkim dowodem wartości.

3. **Brak ownera po stronie klubu**  
   -> wymagać wskazanego managera wdrożenia.

4. **Niedomknięta analityka**  
   -> wdrożyć event taxonomy przed rolloutem.

5. **Niedoszacowanie supportu**  
   -> pakiety wsparcia + SLA od początku.

---

## 11) Co robić od jutra (priorytet operacyjny)

1. Zdefiniować i wdrożyć model multi-tenant (organizacja/klub/role).  
2. Zbudować dashboard managera z 6 KPI.  
3. Przygotować ofertę pilota + wzór umowy + kryteria sukcesu.  
4. Odpalić pilota w 1 lokalizacji ST8 Gym.  
5. Po 6–8 tygodniach: decyzja o rollout na całą sieć.

---

## 12) Finalna rekomendacja strategiczna

Najmocniejszy ruch: **zostawić B2C jako kanał dodatkowy, ale główną energię wrzucić w B2B2C dla siłowni.**  
Masz już rdzeń produktu, który rozwiązuje realny ból klubu (retencja + aktywizacja + wartość członka). Brakuje głównie warstwy organizacyjnej i narzędzi managerskich — to da się dowieźć iteracyjnie, bez przepisywania całej aplikacji.

To jest pivot, który może dać szybszy i stabilniejszy przychód niż klasyczne „gonienie pojedynczych userów B2C”.

---

## 13) Źródła (rynek i kontekst)

1. Aurafit kod + dokumentacja lokalna (`/home/ubuntu/clawd/aplikacja-fitness/*`)  
2. Strona produktu: https://aurafit.pl  
3. Artykuł branżowy PL (rynek i operatorzy):  
   https://www.fit.pl/fitbiz/branza-fitness-w-polsce-bije-rekordy-kto-dominuje-rynek-i-co-przyniesie-przyszlosc-na-podstawie-artykulu-hansa-muencha-dla-bodymedia/21736  
4. Kontekst retencji i onboardingu klubowego (materiały branżowe):  
   https://www.glofox.com/blog/gym-member-retention-strategies/

> Uwaga metodologiczna: dane z publikacji branżowych i artykułów marketingowych traktować jako kierunkowe; przed finalnym deckiem inwestycyjnym warto domknąć je o 1–2 raporty płatne (np. EuropeActive / Deloitte, HFA/IHRSA, PMR).
