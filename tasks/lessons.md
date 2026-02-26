# Lessons

- Single-file HTML+JS was too fragile for this app scale; modular React architecture reduces regression risk.
- Mobile Safari table rendering must be handled with explicit overflow strategy (`min-width` + horizontal scroll) and safe word wrapping.
- For deploy reliability, always keep `main` and deploy branch (`master`) in sync and verify remote SHA.
- Auth/data source must be local/deploy-coherent (`/.netlify/functions/notes`), not external dead endpoints.
- **iOS Safari PWA layout: NIGDY nie używaj flex-nowrap + min-w-full + translateX do "carousel" przełączania paneli.** Safari PWA z safe-area, dvh i viewport-fit: cover reaguje offsetem całego widoku. Sprawdzony, stabilny pattern to klasyczny `hidden md:flex` toggle — jeden panel widoczny na raz, bez transformów. Jeśli animacja jest potrzebna, testuj na prawdziwym iPhonie, nie na emulatorze.
- **Viewport units na iOS:** Zawsze dawaj fallback `min-h-[100svh]` obok `h-[100dvh]`. Safari PWA może mieć rozbieżność między dvh a svh przy zmianie orientacji / klawiatury.
- **Safe-area insets:** Używaj `env(safe-area-inset-*, 0px)` z fallbackiem `0px` zgodnie z MDN — `max(env(...), 0px)` nie jest wymagane i może być problematyczne.
- Jeśli użytkownik zgłasza, że zmiany są na `origin/main`, najpierw zweryfikuj `git branch -vv` i wykonaj `git pull --ff-only` przed analizą przyczyny błędu lokalnie.
