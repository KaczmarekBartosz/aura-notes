# Aura Notes iOS

Mobilna, offline-first wersja `aura-notes` na Expo Router z lokalnym vaultem markdown i cache SQLite.

## Zakres aplikacji

- setup Expo + TypeScript + Expo Router
- NativeWind (soft minimal design tokens)
- SQLite cache (`expo-sqlite`) + offline read
- sync do API (`EXPO_PUBLIC_NOTES_API_URL`) z fallbackiem do cache/bundled/seed
- auto-sync po odzyskaniu internetu i po powrocie appki na foreground
- 4 ekrany:
  - `/` lista notatek
  - `/reader/[id]` czytnik markdown + progress + pinch zoom
  - `/search` full-text search
  - `/settings` theme + cache info
- continue reading: zapamiętywanie ostatnio otwartej notatki
- zapamiętywanie pozycji scrolla per notatka
- haptics dla kluczowych interakcji (otwieranie, filtry, favorite)
- deep link scheme: `aura-notes://reader/:id`
- tryby motywu: `System`, `Light`, `Dark`, `Crystal Line` + dodatkowe presety Aura
- ręczna paginacja listy dla stabilnego scrolla na iOS
- usuwanie nieaktualnych notatek z lokalnego vaultu przy synchronizacji

## Struktura

```txt
mobile/
  app/
    _layout.tsx
    index.tsx
    reader/[id].tsx
    search.tsx
    settings.tsx
  src/
    components/
    constants/
    db/
    services/
    state/
    theme/
    types/
    utils/
```

## Uruchomienie

```bash
cd mobile
npm install
npm run sync:notes-index
npm run start
```

Uruchomienie na iPhone przez tunel (polecane na Windows):

```bash
npm run start:tunnel
```

Na macOS:

```bash
npm run ios
```

## Konfiguracja API

Utwórz plik `.env` w katalogu `mobile/`:

```env
EXPO_PUBLIC_NOTES_API_URL=http://YOUR_HOST:3000/api/notes
EXPO_PUBLIC_NOTES_PASSWORD=local
```

Jeżeli API jest niedostępne, appka działa z cache SQLite lub bundlowanego `assets/notes-index.json`.

## Aktualizacja lokalnego vaultu

Po każdej zmianie `netlify/functions/data/notes-index.json` odpal:

```bash
cd mobile
npm run sync:notes-index
```

To odświeża `mobile/assets/notes-index.json` i zapewnia aktualny offline vault.

## Troubleshooting iPhone

1. Jeśli Expo pyta o port `8082`, zaakceptuj (`Y`) lub zamknij stary proces na `8081`.
2. Jeśli iPhone nie łączy się z Metro po LAN, użyj `npm run start:tunnel`.
3. Jeśli pojawia się stary cache, uruchom: `npx expo start --tunnel -c`.
