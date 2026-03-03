# Aura Notes v2 — Premium Mobile-First Navigation Redesign

**Data:** 2026-03-03
**Status:** Zatwierdzony
**Autor:** Claude Code + Bartosz Kaczmarek

---

## Cel

Kompletny redesign nawigacji, filtrowania, headera i ogolnego UX aplikacji Aura Notes, aby osiagnac premium, native-grade mobile experience z intuicyjna architektura informacji i zero friction w dostepie do bazy wiedzy.

## Kluczowe zasady kontekstu

1. Caly UI to jeden `'use client'` komponent w `app/page.tsx` — nawigacja stanem React, bez routingu
2. shadcn komponenty w `components/ui/` sa ciezko zmodyfikowane — podwojny rendering `isGlass ? ... : ...`
3. iOS PWA first-class citizen — viewport cover, safe-area insets, gesture/zoom blocking

---

## Sekcja 1: Architektura nawigacji

**Model mentalny:** Trzy poziomy glebokosci

```
Poziom 0: Bottom Nav (4 taby: Przeglad / Biurko / Szukaj / Motyw)
Poziom 1: Lista kategorii -> po wyborze -> lista notatek z tagami
Poziom 2: Reader (full-screen slide-in)
```

**Flow uzytkownika — "znajdz notatke o peptydach":**
1. Tap "Przeglad" (juz aktywny) -> widzi kategorie jako horyzontalny scroll
2. Tap "Fitness" -> kategorie zawezaja sie, pojawiaja sie tagi `#hgh #peptides #sleep`
3. Tap `#peptides` -> filtruje liste
4. Tap notatke -> slide-in reader
5. Swipe-right-from-edge -> powrot do listy

**Stan aplikacji (React state):**
```typescript
type AppView = 'browse' | 'desk' | 'search' | 'theme';
type NavigationState = {
  activeTab: AppView;
  activeCategory: string | null;  // null = "Wszystkie"
  activeTag: string | null;       // null = bez filtra tagu
  selectedNoteId: string | null;
  isReaderOpen: boolean;          // steruje slide transition
  isSearchOpen: boolean;          // steruje search overlay
};
```

**Kluczowe decyzje:**
- "Wszystkie" jako domyslna kategoria (nie wymusza wyboru)
- Tab "Biurko" = flat lista ulubionych, bez kategorii/tagow — szybki dostep
- Tab "Szukaj" = global search po wszystkich notatkach, niezalezny od aktywnej kategorii
- Tab "Motyw" = theme picker (obecny ThemeSwitcher, ale full-screen card picker)
- Back navigation: kategorie maja breadcrumb `<- Wszystkie / Fitness / #peptides`

---

## Sekcja 2: Collapsing Header

**Zachowanie:**
- Stan domyslny: kompaktowy header (48px): nazwa kategorii + ikona search + ikona sort/menu
- Scroll down: header chowa sie (transform: translateY(-100%) z 200ms ease)
- Scroll up: header wraca
- Tap search icon: search overlay (full-width input z backdrop-blur) — zamyka sie na Escape lub tap outside
- Search kontekstowy: placeholder mowi "Szukaj w Fitness..." gdy kategoria aktywna, "Szukaj we wszystkich..." gdy globalne

**Tagi pod headerem:**
- Horyzontalny scroll (nie wrap!) — max 1 linia, overflow-x: auto, -webkit-overflow-scrolling: touch
- Pojawiaja sie TYLKO po wyborze kategorii (progressive disclosure)
- Snap scrolling na chip boundaries
- "Wszystkie" chip zawsze pierwszy (sticky left)

---

## Sekcja 3: Note Cards (Compact Rows)

**Struktura pojedynczego wiersza:**
```
+-----------------------------------+
| GLP-1 Protocol Guide            * |  <- title (font-semibold) + fav star
| Comprehensive guide to GLP-1...   |  <- excerpt (1 line, opacity-60)
| 5 min . dzisiaj . fitness         |  <- meta row (opacity-40)
+-----------------------------------+
```

- Touch target: min 64px height (caly wiersz klikalny)
- Aktywna notatka: 3px border-left w kolorze --primary + subtle bg tint
- Gwiazdka: min 44x44px touch target, toggle z micro-bounce (scale 0.9 -> 1.1 -> 1.0)
- Excerpt: generowany z note.excerpt lub pierwszych ~80 znakow plainText
- Relative time: "dzisiaj", "wczoraj", "3 dni temu" zamiast pelnych dat (Intl.RelativeTimeFormat)
- Separator: 1px border-bottom w --border, nie thick brutalist borders

---

## Sekcja 4: Reader View (Slide Transition)

**Wejscie:**
- Slide from right: transform: translateX(100%) -> translateX(0)
- Timing: 300ms cubic-bezier(0.32, 0.72, 0, 1) (iOS spring curve)
- Bottom nav: fade out + translateY(100%) jednoczesnie

**Header readera:**
- Compact: Back button (44x44) + tytul notatki (line-clamp-1) + progress bar (2px na samej gorze)
- Scroll down 100px -> header collapses do progress bar only
- Scroll up -> header wraca

**Zamkniecie:**
- Back button (tap)
- Edge swipe (panGesture od lewej krawedzi, 20px threshold)
- Escape key (desktop)

**Zachowany z obecnej wersji:**
- Reading progress bar
- Markdown rendering (react-markdown + rehype)
- Metadata header notatki (daty, tagi)
- Keyboard navigation (up/down arrows)

---

## Sekcja 5: Bottom Navigation

**Design:**
- Tlo: glass blur lub solid bg (zalezne od aktywnego theme)
- 4 taby: ikona (24px) + label (10px, uppercase w brutalist, normal w glass)
- Aktywny tab: ikona filled + label bold + subtle indicator dot/line nad ikona
- Safe area: padding-bottom: env(safe-area-inset-bottom)
- Chowa sie w reader mode (slide down 300ms)

**Taby:**

| Tab | Ikona | Funkcja |
|-----|-------|---------|
| Przeglad | LayoutGrid | Hierarchia kategorii -> notatki |
| Biurko | Star | Flat lista ulubionych |
| Szukaj | Search | Global search overlay |
| Motyw | Palette | Theme picker (full-screen cards) |

---

## Sekcja 6: Empty States

| Kontekst | Tekst | Podtekst |
|----------|-------|----------|
| Pusta kategoria | "Brak notatek w *kategoria*" | "Dodaj pliki .md do memory/ i przebuduj" |
| Brak wynikow search | "Nie znaleziono *query*" | "Sprobuj inne slowa kluczowe lub zmien kategorie" |
| Biurko puste | "Twoje biurko jest puste" | "Oznacz notatki gwiazdka aby je tu zobaczyc" |
| Zadna notatka nie wybrana (desktop) | "Wybierz notatke" | "{count} notatek dostepnych" |

Kazdy empty state: wycentrowany, z ikona Lucide (48x48, opacity 20%) nad tekstem.

---

## Sekcja 7: Pliki do zmiany

| Plik | Zmiana |
|------|--------|
| `app/page.tsx` | Najwieksza zmiana — refaktor na nowa architekture nawigacji, slide transition, collapsing header |
| `app/globals.css` | Nowe klasy: .slide-enter, .slide-exit, .collapsing-header, nowe .chip styles (horizontal scroll) |
| `lib/hooks.ts` | Nowe hooki: useCollapsibleHeader, useSlideTransition, useEdgeSwipe, useRelativeTime |
| `components/glass/ThemeSwitcher.tsx` | Rozbudowa do full-screen card picker (tab "Motyw") |

**NIE zmieniamy:**
- `lib/theme.tsx`, `types/theme.ts` — system motywow zostaje intact
- `lib/types.ts` — model danych notatek bez zmian
- `layout.tsx` — PWA config bez zmian
- Backend (netlify functions, build-index) — zero zmian
- `components/ui/*` — shadcn components bez zmian
