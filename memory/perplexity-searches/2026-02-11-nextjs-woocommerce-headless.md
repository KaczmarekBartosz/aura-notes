---
title: "Perplexity Search: Next.js + WooCommerce Headless Architecture"
subcategory: "ui-ux"
category: "design"
tags: ["design", "ui", "ux"]
type: "daily-log"
created: "2026-02-11"
updated: "2026-02-11"
source: "manual"
ai_generated: false
---

# Perplexity Search: Next.js + WooCommerce Headless Architecture

**Query:** Jak połączyć frontend React/Next.js z WooCommerce (e-commerce), wczytywanie produktów z innego serwera, zarządzanie produktami

**Date:** 2026-02-11

---

## Główne podejścia architektoniczne

### 1. REST API (WooCommerce REST API v3)

**Oficjalna dokumentacja:** https://woocommerce.github.io/woocommerce-rest-api-docs/

**Kluczowe endpointy:**
- `GET /wp-json/wc/v3/products` — lista produktów
- `GET /wp-json/wc/v3/products/{id}` — szczegóły produktu
- `GET /wp-json/wc/v3/orders` — zamówienia
- `POST /wp-json/wc/v3/orders` — tworzenie zamówienia
- `GET /wp-json/wc/v3/customers` — klienci

**Autentykacja:**
- Consumer Key + Consumer Secret (Basic Auth)
- OAuth 1.0a dla produkcji
- JWT (JSON Web Tokens) — rekomendowane dla headless

**Przykład fetch w Next.js (Server Side):**
```typescript
// app/api/products/route.ts
export async function GET() {
  const res = await fetch(`${process.env.WOO_URL}/wp-json/wc/v3/products`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.WOO_CONSUMER_KEY}:${process.env.WOO_CONSUMER_SECRET}`
      ).toString('base64')
    },
    next: { revalidate: 60 } // ISR
  });
  return res.json();
}
```

### 2. GraphQL (WPGraphQL + WooGraphQL)

**Stack:**
- WPGraphQL — GraphQL dla WordPress
- WooGraphQL — rozszerzenie dla WooCommerce

**Zalety:**
- Pobierasz tylko potrzebne pola
- Jedno zapytanie zamiast wielu REST calli
- Lepsze zarządzanie relacjami (produkty + kategorie + atrybuty)

**Przykład zapytania:**
```graphql
query GetProducts {
  products(first: 10) {
    nodes {
      id
      name
      price
      regularPrice
      salePrice
      image {
        sourceUrl
      }
      categories {
        nodes {
          name
        }
      }
    }
  }
}
```

---

## Kluczowe repozytoria (gotowe rozwiązania)

### w3bdesign/nextjs-woocommerce
**URL:** https://github.com/w3bdesign/nextjs-woocommerce
- Next.js 15.1.7 + React 18.3.1
- TypeScript
- GraphQL API
- Algolia search
- Playwright tests
- Koszyk + checkout (bez redirectów do WP)

### imranhsayed/nextjs-woocommerce-restapi
**URL:** https://github.com/imranhsayed/nextjs-woocommerce-restapi
- REST API (nie GraphQL)
- JWT + HttpOnly cookies
- ISR (Incremental Static Regeneration)
- Dynamiczne generowanie stron produktów
- Menu + widgets z WordPress

### Onixaz/nextjs-woocommerce-storefront
**URL:** https://github.com/Onixaz/nextjs-woocommerce-storefront
- Czysty REST API
- SWR do client-side fetching
- Next.js API routes jako proxy
- Truly headless (bez redirectów)

---

## CORS i bezpieczeństwo (frontend na innym serwerze)

### Problem
Gdy Next.js jest na Vercel, a WooCommerce na innym hostingu — trzeba obsłużyć CORS.

### Rozwiązania

**1. Next.js API Routes jako proxy (rekomendowane)**
```typescript
// app/api/woo/[...path]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const res = await fetch(`${WOO_API_URL}/${path}`, {
    headers: {
      'Authorization': `Basic ${base64Credentials}`
    }
  });
  return new Response(res.body, { headers: res.headers });
}
```

**2. WordPress CORS headers (wp-config.php)**
```php
header("Access-Control-Allow-Origin: https://twoj-frontend.vercel.app");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
```

**3. Cloudflare w środku**
- Cache dla assetów i API
- Bypass dla endpointów sesji
- Zabezpieczenie przed rate limit

---

## Zarządzanie produktami (CRUD)

### Pobieranie (Read)
- ISR dla list produktów (statyczne + odświeżanie)
- SSR dla stron produktu (SEO)
- Client-side dla filtrów/sortowania

### Tworzenie/Edycja (Write) — dla admina
```typescript
// Tworzenie produktu
fetch('/api/woo/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Nowy produkt",
    regular_price: "99.99",
    description: "Opis...",
    images: [{ src: "https://..." }]
  })
});
```

**Uwaga:** Zapisy wymagają uprawnień administratora (JWT z odpowiednimi rolami).

---

## Koszyk i checkout (najtrudniejsza część)

### Opcje:

**1. WooCommerce Session API**
- Endpoint: `/wp-json/wc/store/v1/cart`
- Cookie-based sessions
- Problem: CORS + credentials

**2. Custom cart w Redis/DB**
- Koszyk przechowywany po stronie Next.js
- Synchronizacja z Woo przy checkout

**3. Hybrid (rekomendowane)**
- Client-side cart (localStorage + React Context)
- Walidacja przez Woo API
- Checkout przez WooCommerce (redirect lub iframe)

---

## Caching i wydajność

### Rekomendacje z Reddit (produkcja)
- **Cloudflare** — cache przed API
- **ISR** — statyczne strony produktów
- **SWR/React Query** — client-side cache
- **Rate limiting** — GraphQL bez cache = wybuch liczby requestów
- **Sesje tylko client-side** — inaczej tracisz ISR/SSR

### Czego unikać
- Server-side sessions (psuje ISR)
- Dynamiczne renderowanie dla każdej strony
- Brak cache dla GraphQL

---

## Podsumowanie rekomendacji

| Element | Technologia |
|---------|-------------|
| API | WPGraphQL + WooGraphQL |
| Autentykacja | JWT + HttpOnly cookies |
| Fetching | Next.js API Routes (proxy) |
| Cache | ISR + SWR + Cloudflare |
| Koszyk | Custom client-side + Woo validation |
| Checkout | Hybrid (custom form + Woo order API) |

---

## Źródła

1. https://github.com/w3bdesign/nextjs-woocommerce
2. https://github.com/imranhsayed/nextjs-woocommerce-restapi
3. https://github.com/Onixaz/nextjs-woocommerce-storefront
4. https://blazecommerce.io/blog/headless-woocommerce-with-next-js/
5. https://woocommerce.github.io/woocommerce-rest-api-docs/
6. https://developer.woocommerce.com/docs/apis/rest-api/
7. https://www.reddit.com/r/nextjs/comments/1mcegud/headless_woocommerce_with_nextjs_frontend_anyone/
8. https://medium.com/geekculture/headless-woocommerce-next-js-set-up-next-js-b8d2193b2688
