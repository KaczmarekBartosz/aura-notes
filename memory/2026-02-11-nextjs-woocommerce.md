---
title: "Session: 2026-02-11 09:53:54 UTC"
subcategory: "ui-ux"
category: "design"
tags: ["design", "ui", "ux"]
type: "daily-log"
created: "2026-02-11"
updated: "2026-02-11"
source: "manual"
ai_generated: false
---

# Session: 2026-02-11 09:53:54 UTC

- **Session Key**: agent:coder:main
- **Session ID**: acf9c2c0-c20e-4bb5-835d-655609569676
- **Source**: telegram

## Conversation Summary

assistant: Rozumiem. Tworzę strukturę na wyniki wyszukiwania Perplexity — zapis z datą, tagami i linkiem do źródła. Będziesz mógł do tego wracać i cytować.
assistant: Gotowe. Folder `memory/perplexity-searches/` utworzony, zasada zapisana w MEMORY.md. Będę zapisywał każde wyszukiwanie jako `YYYY-MM-DD-slug.md` z query, źródłami i wnioskami — łatwo będzie do tego wrócić i cytować.
user: [Telegram Bartosz Kaczmarek (@niconpl) id:5967412834 +2m Wed 2026-02-11 07:24 UTC] Swietnie. Wyszukaj teraz informacje jak najlepiej polaczyc front oparty o react i next js dla e commeece z woocomerce, bo robie taki projekt i potrzebuje informacji jak wczytac produkty z woo do frontu na innym serwerze. I jak nimi zarzadzac rowniez.
[message_id: 4777]
assistant: Mam wystarczająco informacji. Zapisuję wyniki i daję Ci podsumowanie.
assistant: Zapisane do `memory/perplexity-searches/2026-02-11-nextjs-woocommerce-headless.md`.

**Krótko:**

**Opcje API:**
1. **REST API** — prostsze, oficjalne, dobre na start
2. **GraphQL (WPGraphQL + WooGraphQL)** — elastyczniejsze, mniej requestów, rekomendowane dla większych sklepów

**Kluczowy problem (CORS):**
Gdy Next.js jest na innym serwerze (Vercel) niż Woo — użyj **Next.js API Routes jako proxy**. Frontend woła Twój endpoint `/api/woo/products`, a Next.js woła WooCommerce po stronie serwera.

**Gotowe repozytoria:**
- `w3bdesign/nextjs-woocommerce` — GraphQL, TypeScript, Algolia, full checkout
- `imranhsayed/nextjs-woocommerce-restapi` — REST API, JWT, ISR
- `Onixaz/nextjs-woocommerce-storefront` — czysty REST, SWR

**Zarządzanie produktami:**
- Read: ISR (statyczne + odświeżanie) lub SSR
- Write: POST przez API z JWT (wymaga uprawnień admina)

**Koszyk/checkout:**
Najtrudniejsza część. Opcje: WooCommerce Session API (CORS problemy), custom cart (Redis), lub hybrid (client-side + walidacja Woo).

Pełne szczegóły, przykłady kodu i linki w pliku.
user: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
assistant: HEARTBEAT_OK
user: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
assistant: HEARTBEAT_OK
user: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
assistant: HEARTBEAT_OK
user: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
assistant: HEARTBEAT_OK
user: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
assistant: HEARTBEAT_OK
