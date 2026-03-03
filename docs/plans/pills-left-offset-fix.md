# Aura Notes: Problem z lewym odstępem scrollowanych pillsów (iOS/PWA)

## Kontekst
W widoku listy notatek, poziomo przewijane pillsy (kategorie i tagi) wizualnie „przyklejały się” do lewej krawędzi ekranu mimo prób ustawiania `padding-left`/`margin-left`.

## Objawy
- pierwszy pill wyglądał jakby zaczynał się od samej krawędzi ekranu,
- zmiany `margin-left` na kontenerze były słabo widoczne lub znikały,
- efekt był bardziej zauważalny na iPhone/PWA.

## Główna przyczyna
Problem wynikał z połączenia:
- poziomego scrolla + maskowania (`mask-image`),
- safe area iOS (`env(safe-area-inset-left)`),
- offsetu realizowanego tylko na kontenerze, a nie na faktycznej zawartości scrolla.

W praktyce: sam `margin-left`/`padding-left` na wrapperze bywa wizualnie „zjadany” przez sposób renderowania warstwy scrollowanej i maski.

## Rozwiązanie (docelowe)
Zastosowano wzorzec stabilny na mobile:
1. **Leading spacer jako pierwszy element** w rzędzie pillsów.
2. **`scroll-padding-left`** na kontenerze scrolla.
3. Uproszczenie offsetów kontenera (bez walki samym `margin-left`).

## Konkretna implementacja
### 1) CSS (`app/globals.css`)
- `.chip-scroll`:
  - `scroll-padding-left: calc(1rem + env(safe-area-inset-left, 0px));`
- `.chip-scroll-categories`:
  - `scroll-padding-left: calc(1.25rem + env(safe-area-inset-left, 0px));`
- nowa klasa:
  - `.chip-scroll-spacer { flex: 0 0 calc(0.95rem + env(safe-area-inset-left, 0px)); }`
  - `.chip-scroll-categories .chip-scroll-spacer { flex-basis: calc(1.15rem + env(safe-area-inset-left, 0px)); }`

### 2) JSX (`app/page.tsx`)
W obu rzędach scrollowanych pillsów (kategorie i tagi) dodano jako pierwszy element:

```tsx
<span className="chip-scroll-spacer" aria-hidden />
```

Dzięki temu pierwszy właściwy pill **zawsze** zaczyna się po lekkim, stałym odstępie od lewej krawędzi.

## Dlaczego to działa lepiej niż sam margin
- Spacer jest częścią **samej treści scrolla**, więc nie zależy od efektów ubocznych maski i overflow.
- `scroll-padding-left` dodatkowo stabilizuje pozycję początkową i snapowanie.
- Zachowanie jest przewidywalne na iOS Safari/PWA.

## Checklista na przyszłość
- dla poziomych chipów używaj `leading spacer` + `scroll-padding-left`,
- nie polegaj wyłącznie na `margin-left` wrappera,
- przy `mask-image` testuj początek i koniec listy na iPhone (PWA),
- weryfikuj po wdrożeniu przez rzeczywiste przewijanie palcem.
