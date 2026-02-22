# Session: 2026-02-21 16:34:10 UTC

- **Session Key**: agent:coder:main
- **Session ID**: a0d9cd5d-ad69-423a-9cf2-56cbd90ea670
- **Source**: telegram

## Conversation Summary

user: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
Current time: Saturday, February 21st, 2026 — 4:01 AM (UTC)
assistant: HEARTBEAT_OK
assistant: 📊 **Daily Token Report - February 20, 2026**

**Total Usage: 67,578,522 tokens**

**By Model:**
• kimi-coding/k2p5: 53,322,584 (79%)
• google-gemini-cli/gemini-3-pro-preview: 14,255,938 (21%)

**3-Day Trend:**
• Feb 18: 2,380,633
• Feb 19: 8,074,330
• Feb 20: 67,578,522 ⬆️ +738%

⚠️ Significant usage spike detected on Feb 20.

_Full report: ~/.openclaw/reports/token-usage/2026-02-20.md_
user: System: [2026-02-21 06:00:33 UTC] Cron (error): **Daily Token Report - February 20, 2026**

✅ Report generated and saved to `~/.openclaw/reports/token-usage/2026-02-20.md`

✅ Summary delivered to Telegram chatId 5967412834 (messageId: 5981)

---

**Key Findings:**

- **Total tokens:** 67,578,522
- **Primary model:** kimi-coding/k2p5 (53.3M tokens, 79%)
- **Secondary:** google-gemini-cli/gemini-3-pro-preview (14.3M tokens, 21%)
- **Notable:** 738% usage spike compared to Feb 19 (8.07M → 67.6M tokens)

Report generation complete.

A scheduled reminder has been triggered. The reminder content is:

Cron (error): **Daily Token Report - February 20, 2026**

✅ Report generated and saved to `~/.openclaw/reports/token-usage/2026-02-20.md`

✅ Summary delivered to Telegram chatId 5967412834 (messageId: 5981)

---

**Key Findings:**

- **Total tokens:** 67,578,522
- **Primary model:** kimi-coding/k2p5 (53.3M tokens, 79%)
- **Secondary:** google-gemini-cli/gemini-3-pro-preview (14.3M tokens, 21%)
- **Notable:** 738% usage spike compared to Feb 19 (8.07M → 67.6M tokens)

Report generation complete.

Please relay this reminder to the user in a helpful and friendly way.
Current time: Saturday, February 21st, 2026 — 6:01 AM (UTC)
assistant: **Token usage spike noticed** — Feb 20 hit 67.6M tokens (738% jump from previous day). Report already sent to Telegram.

Kimi K2.5 was the heavy lifter at 53M tokens. Worth checking if that was expected or if something looped.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5982",
  "sender": "5967412834"
}
```

Wyslij mi dokladny schemat pliku json na podstawie ktorego mam opracowac dane dla kazdego mebla by zachowac spojnosc.
assistant: Oto produkcyjny schemat JSON dla mebli — kompletny, typowany i gotowy do walidacji:

```json
{
  "furniture": {
    "id": "string (uuid/sku)",
    "sku": "string (unique)",
    "slug": "string (url-friendly)",
    
    "names": {
      "display": "string (marketing name)",
      "internal": "string (warehouse name)",
      "seo": "string (meta title)"
    },
    
    "category": {
      "primary": "string (enum: sofa, chair, table, storage, bed, etc.)",
      "subcategory": "string",
      "breadcrumbs": ["string"]
    },
    
    "attributes": {
      "style": ["string"],
      "room": ["living-room", "bedroom", "office", "dining", "outdoor"],
      "materials": {
        "primary": "string",
        "secondary": ["string"],
        "upholstery": "string",
        "finish": "string"
      },
      "colors": [{
        "name": "string",
        "hex": "string (#RRGGBB)",
        "assetId": "string"
      }]
    },
    
    "dimensions": {
      "unit": "cm|in",
      "overall": {
        "width": "number",
        "height": "number",
        "depth": "number",
        "weight": "number"
      },
      "seating": {
        "height": "number",
        "depth": "number"
      },
      "packaging": {
        "boxes": "number",
        "totalWeight": "number",
        "dimensions": [{"w": "number", "h": "number", "d": "number"}]
      }
    },
    
    "variants": [{
      "variantId": "string",
      "sku": "string",
      "name": "string",
      "priceModifier": "number (+/- from base)",
      "attributes": {
        "color": "string",
        "size": "string",
        "material": "string"
      },
      "stock": {
        "quantity": "number",
        "status": "in-stock|low-stock|out-of-stock|preorder",
        "restockDate": "ISO date|null"
      }
    }],
    
    "pricing": {
      "base": "number",
      "currency": "string (PLN|EUR|USD)",
      "sale": {
        "price": "number|null",
        "startDate": "ISO date|null",
        "endDate": "ISO date|null"
      },
      "vatRate": "number (0.23 for 23%)"
    },
    
    "media": {
      "hero": {
        "imageId": "string",
        "alt": "string",
        "aspectRatio": "string (16:9|4:3|1:1)"
      },
      "gallery": [{
        "imageId": "string",
        "type": "lifestyle|detail|dimension|material",
        "alt": "string",
        "sortOrder": "number"
      }],
      "videos": [{
        "videoId": "string",
        "type": "assembly|lifestyle|360",
        "thumbnailId": "string"
      }],
      "models": {
        "gltf": "string|null",
        "usdz": "string|null"
      }
    },
    
    "description": {
      "short": "string (max 160 chars)",
      "full": "string (markdown supported)",
      "features": ["string"],
      "careInstructions": ["string"],
      "assembly": {
        "required": "boolean",
        "difficulty": "easy|medium|hard",
        "timeMinutes": "number",
        "instructionsPdf": "string|null"
      }
    },
    
    "logistics": {
      "deliveryType": "courier|freight|white-glove",
      "assemblyService": "boolean",
      "warranty": {
        "durationYears": "number",
        "type": "standard|extended|lifetime"
      },
      "returnPolicy": {
        "days": "number",
        "conditions": "string"
      }
    },
    
    "relationships": {
      "collection": "string|null",
      "complementary": ["sku"],
      "similar": ["sku"],
      "requires": ["sku"]
    },
    
    "metadata": {
      "createdAt": "ISO datetime",
      "updatedAt": "ISO datetime",
      "isActive": "boolean",
      "isFeatured": "boolean",
      "tags": ["string"],
      "searchKeywords": ["string"]
    },
    
    "seo": {
      "metaTitle": "string (max 60)",
      "metaDescription": "string (max 160)",
      "canonical": "string",
      "structuredData": "object (Schema.org)"
    }
  }
}
```

**Kluczowe zasady:**

1. **SKU jako anchor** — wszystko kręci się wokół SKU, nie id
2. **Warianty osobno** — każdy kolor/rozmiar to osobny variant z własnym stockiem
3. **Media modularne** — obrazki przez ID, nie URL (CDN zarządza path)
4. **Dimensions zawsze** — bez wymiarów mebel nie istnieje
5. **Pricing bez stringów** — liczby + currency code, formatowanie w UI

**Przykład minimalny (tylko required):**
```json
{
  "id": "sofa-001",
  "sku": "AURA-SF-LIN-GRY",
  "names": { "display": "Sofa Lina" },
  "category": { "primary": "sofa" },
  "pricing": { "base": 2499, "currency": "PLN" },
  "dimensions": { "unit": "cm", "overall": { "width": 220, "height": 85, "depth": 95 } },
  "variants": [{ "variantId": "v1", "sku": "AURA-SF-LIN-GRY", "stock": { "status": "in-stock" } }]
}
```

Chcesz żebym dodał jeszcze coś? np. integracje z ERP, lokalizacje, czy atrybuty specyficzne dla kategorii (np. twardość materaca, rodzaj drewna)?
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5987",
  "sender": "5967412834"
}
```

A ten zloty standard?
assistant: Oto **złoty standard** — pełny, produkcyjny przykład z realnymi danymi + reguły jakości.

---

## 📋 Przykład produkcyjny (Sofa "Nordic")

```json
{
  "furniture": {
    "id": "sf-nrd-001",
    "sku": "NORDIC-3S-LIN-BE",
    "slug": "sofa-nordic-3-osobowa-len-beżowa",
    
    "names": {
      "display": "Sofa Nordic 3-osobowa",
      "internal": "SOFA NORDIC 3S LEN BEŻ",
      "seo": "Sofa Nordic 3-osobowa z lnu | Aura Meble"
    },
    
    "category": {
      "primary": "sofa",
      "subcategory": "sofa-3-osobowe",
      "breadcrumbs": ["meble", "salon", "sofy", "sofy-3-osobowe"]
    },
    
    "attributes": {
      "style": ["skandynawski", "minimalistyczny"],
      "room": ["living-room"],
      "materials": {
        "primary": "lite drewno dębowe",
        "secondary": ["płyta meblowa HDF", "pianka HR"],
        "upholstery": "100% len (gramatura 350g/m²)",
        "finish": "olejowosk naturalny"
      },
      "colors": [
        {
          "name": "Naturalny Beż",
          "hex": "#D4C4B0",
          "assetId": "color-nordic-beige-001"
        },
        {
          "name": "Grafit",
          "hex": "#3A3A3A",
          "assetId": "color-nordic-graphite-001"
        }
      ]
    },
    
    "dimensions": {
      "unit": "cm",
      "overall": {
        "width": 220,
        "height": 82,
        "depth": 95,
        "weight": 58
      },
      "seating": {
        "height": 45,
        "depth": 60
      },
      "packaging": {
        "boxes": 2,
        "totalWeight": 64,
        "dimensions": [
          {"w": 225, "h": 45, "d": 100},
          {"w": 120, "h": 30, "d": 80}
        ]
      }
    },
    
    "variants": [
      {
        "variantId": "v-beige",
        "sku": "NORDIC-3S-LIN-BE",
        "name": "Naturalny Beż",
        "priceModifier": 0,
        "attributes": {
          "color": "Naturalny Beż",
          "size": "3-osobowa",
          "material": "len"
        },
        "stock": {
          "quantity": 12,
          "status": "in-stock",
          "restockDate": null
        }
      },
      {
        "variantId": "v-graphite",
        "sku": "NORDIC-3S-LIN-GR",
        "name": "Grafit",
        "priceModifier": 0,
        "attributes": {
          "color": "Grafit",
          "size": "3-osobowa",
          "material": "len"
        },
        "stock": {
          "quantity": 3,
          "status": "low-stock",
          "restockDate": "2026-03-15"
        }
      }
    ],
    
    "pricing": {
      "base": 3499,
      "currency": "PLN",
      "sale": {
        "price": 2999,
        "startDate": "2026-02-20T00:00:00Z",
        "endDate": "2026-03-10T23:59:59Z"
      },
      "vatRate": 0.23
    },
    
    "media": {
      "hero": {
        "imageId": "nordic-hero-001",
        "alt": "Sofa Nordic w salonie skandynawskim, beżowy len",
        "aspectRatio": "16:9"
      },
      "gallery": [
        {
          "imageId": "nordic-lifestyle-001",
          "type": "lifestyle",
          "alt": "Sofa Nordic w aranżacji salonu z roślinami",
          "sortOrder": 1
        },
        {
          "imageId": "nordic-detail-001",
          "type": "detail",
          "alt": "Detal szycia i nóg z litego dębu",
          "sortOrder": 2
        },
        {
          "imageId": "nordic-dim-001",
          "type": "dimension",
          "alt": "Wymiary sofy Nordic z oznaczeniami",
          "sortOrder": 3
        }
      ],
      "videos": [],
      "models": {
        "gltf": null,
        "usdz": null
      }
    },
    
    "description": {
      "short": "Klasyczna sofa skandynawska z tapicerką z naturalnego lnu i nogami z litego dębu. Wygodna, ponadczasowa, trwała.",
      "full": "## Sofa Nordic - ponadczasowy skandynawski design\n\nSofa **Nordic** to kwintesencja skandynawskiego designu: czyste linie, naturalne materiały, funkcjonalność. Stworzona dla tych, którzy cenią prostotę i trwałość.\n\n### Cechy:\n- **Tapicerka**: 100% len (prażony, miękki w dotyku)\n- **Nogi**: lite drewno dębowe\n- **Wypełnienie**: pianka HR + sprężyny faliste\n- **Gwarancja**: 5 lat na konstrukcję",
      "features": [
        "Rama z drewna bukowego i płyty HDF",
        "Pianka wysokoelastyczna HR 35 kg/m³",
        "Sprężyny faliste (siedzisko)",
        "Pokrowce zdejmowane do prania",
        "Nośność 150 kg na miejsce"
      ],
      "careInstructions": [
        "Odkurzać miękką szczotką",
        "Plamy usuwać wilgotną ściereczką",
        "Pokrowce prać w 30°C"
      ],
      "assembly": {
        "required": true,
        "difficulty": "easy",
        "timeMinutes": 20,
        "instructionsPdf": "manual-nordic-3s.pdf"
      }
    },
    
    "logistics": {
      "deliveryType": "freight",
      "assemblyService": true,
      "warranty": {
        "durationYears": 5,
        "type": "standard"
      },
      "returnPolicy": {
        "days": 14,
        "conditions": "oryginalne opakowanie, brak śladów użytkowania"
      }
    },
    
    "relationships": {
      "collection": "nordic",
      "complementary": ["NORDIC-ARM-LIN-BE", "NORDIC-TBL-OAK-001"],
      "similar": ["OSLO-3S-VELVET-GN"],
      "requires": []
    },
    
    "metadata": {
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-02-20T14:22:00Z",
      "isActive": true,
      "isFeatured": true,
      "tags": ["bestseller", "skandynawski", "len", "eko"],
      "searchKeywords": ["sofa beżowa", "skandynawska sofa", "sofa len", "nordycki design"]
    },
    
    "seo": {
      "metaTitle": "Sofa Nordic 3-osobowa | Len Naturalny | Aura Meble",
      "metaDescription": "Kup sofa Nordic 3-osobowa z tapicerką z lnu. Nogi dąb, pianka HR. Darmowa dostawa. Gwarancja 5 lat. Sprawdź wymiary!",
      "canonical": "https://aurameble.pl/sofa-nordic-3-osobowa-len-beżowa",
      "structuredData": {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Sofa Nordic 3-osobowa"
      }
    }
  }
}
```

---

## ✅ Złoty Standard - Checklist (musisz mieć)

| Poziom | Pole | Warunek |
|--------|------|---------|
| **BLOCKER** | SKU | Unikalny, niezmienny, format: `KATEGORIA-MODEL-MATERIAL-KOLOR` |
| **BLOCKER** | Cena | Brutto, w PLN, bez promocji w `base` |
| **BLOCKER** | Wymiary | Wszystkie 3 + waga (łączna) |
| **BLOCKER** | Stock | Dokładna liczba sztuk lub status |
| **BLOCKER** | Zdjęcie hero | Min. 2000px szerokości, 16:9 lub 4:3 |
| **HIGH** | Warianty | Każdy kolor/rozmiar = osobny SKU w variants |
| **HIGH** | Opis pełny | Min. 500 znaków, markdown, podzielony sekcjami |
| **HIGH** | SEO meta | Title max 60 znaków, description max 160 |
| **HIGH** | Waga paczek | Dla kuriera, suma wag = `totalWeight` |
| **MEDIUM** | Zdjęcia | Min. 3: hero, lifestyle, detal |
| **MEDIUM** | Komplementarne | Co pasuje (poduszki, stolik, fotel) |
| **MEDIUM** | Tagi | Min. 3, max 10 |

---

## 🚫 Anti-patterns (co psuje spójność)

❌ **SKU z datą** → `SOFA-2026-001` (nie, SKU jest wieczne)  
❌ **Cena jako string** → `"price": "2499 zł"` (liczba + currency code)  
❌ **Wymiary w opisie** → tylko w `dimensions`  
❌ **Jeden wariant "domyślny"** → każdy kolor to osobny wariant  
❌ **Puste pola** → jeśli nie ma wartości, daj `null`, nie pusty string  

---

**Zapisz sobie ten przykład jako `furniture-gold-standard.json` w repo.** Każdy nowy mebel musi przejść przez tę checklistę zanim trafi do bazy.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5993",
  "sender": "5967412834"
}
```

Poczekaj. Opisz mi zasady tego zlotego standardu by jak najlatwiej bylo mi tym zarzadzac.
assistant: Oto **zasady zarządzania** — system, nie tylko checklista:

---

## 🎯 Filozofia (3 zasady niepodważalne)

| # | Zasada | Konsekwencja |
|---|--------|--------------|
| 1 | **SKU = DNA** | Zmieniasz SKU = nowy produkt. SKU nigdy nie umiera, może być tylko `isActive: false` |
| 2 | **Prawda w danych, nie w opisie** | Jeśli coś jest ważne, musi być w polu strukturalnym, nie w tekście "full" |
| 3 | **Wariant = osobny byt** | Każdy kolor/rozmiar to osobny dokument z własnym SKU, własnym stockiem, własnymi zdjęciami |

---

## 📋 Workflow: Od pomysłu do publikacji

```
[1] STAGING (Excel/Notion)
    ↓ Wypełniasz: nazwa, kategoria, cena, wymiary
    ↓ Output: Draft JSON bez mediów
    
[2] PRODUCTION (Twój CMS/Admin)
    ↓ Dodajesz: zdjęcia, opisy, SEO, warianty
    ↓ Walidacja automatyczna (schema check)
    ↓ Output: Validated JSON
    
[3] REVIEW (Osoba)
    ↓ Sprawdza: czy zdjęcia pasują do kolorów, czy wymiary się zgadzają
    ↓ Output: Approved JSON
    
[4] PUBLISH
    ↓ `isActive: true`, `updatedAt: now`
```

---

## 🏷️ Konwencje nazewnictwa (automatyzują życie)

### SKU Pattern
```
[KATEGORIA-2litery]-[MODEL-4litery]-[MATERIAL-3litery]-[KOLOR-2litery]-[ROZMIAR-1litera]

Przykłady:
SOFA-NORD-LIN-BE-3   (Sofa Nordic, Len, Beż, 3-osobowa)
CHAI-OSLO-VEL-GR-M   (Fotel Oslo, Welur, Grafit, Medium)
TABL-COFF-OAK-NA-1   (Stolik kawowy, Dąb, Naturalny, 1szt)
```

### Slug Pattern
```
[kategoria]-[model]-[rozmiar]-[material]-[kolor]

Przykład:
sofa-nordic-3-osobowa-len-naturalny-bez
```

### Image ID Pattern
```
[sku-lowercase]-[typ]-[numer-dwucyfrowy]

Przykłady:
sofa-nord-lin-be-hero-01
sofa-nord-lin-be-lifestyle-01
sofa-nord-lin-be-detail-01
sofa-nord-lin-be-dimension-01
```

---

## ✅ Checklisty per rola

### Content Manager (Ty/Dana)
- [ ] SKU nie istnieje jeszcze w bazie (check przed tworzeniem)
- [ ] Wszystkie wymiary w cm (nie mm, nie metry)
- [ ] Cena brutto, w PLN
- [ ] Min. 1 wariant z stockiem > 0
- [ ] `slug` unikalny i SEO-friendly
- [ ] `searchKeywords` min. 5 fraz

### Photo Manager
- [ ] Hero: min. 2000px szerokości, 16:9
- [ ] Lifestyle: pokazuje mebel w kontekście (nie na białym)
- [ ] Detail: zbliżenie na materiał/styl
- [ ] Dimension: wymiary naklejone na zdjęcie
- [ ] Każdy kolor = osobny zestaw zdjęć (nigdy nie kolorujemy w Photoshopie)

### Logistics
- [ ] Waga = waga brutto (z opakowaniem)
- [ ] Ilość paczek = rzeczywista
- [ ] Wymiary paczek = rzeczywiste (nie mebla)
- [ ] `deliveryType` dopasowany do wagi (kurier <30kg, freight >30kg)

---

## 🔄 Zarządzanie zmianami (Versioning)

### Co zmieniasz często (safe)
- `pricing.sale.*` — promocje
- `stock.quantity` — stany magazynowe
- `isFeatured` — wyróżnienia
- `tags` — kampanie marketingowe

### Co zmieniasz rzadko (danger zone)
- `sku` — **NIGDY**
- `variants.*.sku` — **NIGDY**
- `dimensions` — tylko jeśli fizycznie zmieniono produkt (wtedy nowy SKU)
- `category.primary` — może zepsuć URL-e i SEO

### Co archiwizujesz (soft delete)
```json
{
  "isActive": false,
  "metadata": {
    "archivedAt": "2026-02-21T10:00:00Z",
    "archiveReason": "end-of-life",
    "successorSku": "SOFA-NORD-LIN-BE-3-V2"
  }
}
```

---

## 🛡️ Walidacja automatyczna (must-have)

Zanim JSON trafi do bazy, musi przejść:

```javascript
// Pseudo-reguły walidacji
1. sku.match(/^[A-Z]{4}-[A-Z]{4}-[A-Z]{3}-[A-Z]{2}(-[A-Z0-9]+)?$/)
2. pricing.base > 0 && pricing.base < 100000
3. dimensions.overall.width > 0 && dimensions.overall.height > 0
4. variants.length >= 1
5. variants.every(v => v.stock.quantity >= 0)
6. media.hero.imageId !== null
7. description.short.length <= 160
8. seo.metaTitle.length <= 60
```

**Narzędzie:** Zrobić prosty skrypt `validate-furniture.js` który odpalasz na każdym nowym JSON-ie.

---

## 📁 Struktura plików w repo

```
/furniture
  /staging
    sofa-nordic-draft.json          # Twoje surowe dane
  /validated
    sofa-nordic.json                # Po checkliście, gotowe do importu
  /archive
    2026-02/
      sofa-nordic-v1.json           # Stara wersja (soft delete)
  /assets
    /sofa-nord-lin-be
      hero-01.jpg
      lifestyle-01.jpg
      ...
  /schemas
    furniture-schema.json           # Definicja schemy walidacji
    validate.js                     # Skrypt walidujący
```

---

## 🚀 Quick Start dla nowego mebla

1. **Skopiuj template** → `furniture/templates/gold-standard.json`
2. **Wypełnij pola wymagane** (SKU, cena, wymiary)
3. **Odpal walidację** → `node validate.js sofa-nordic.json`
4. **Dodaj zdjęcia** do folderu `/assets/[sku]`
5. **Review** — przejrzyj checklistę Content Managera
6. **Import** — wrzuć do bazy/produkcyjnego CMS

---

**Kluczowe:** Nie rób tego na żywca w produkcji. Masz `staging` → `validated` → `production`. Każdy etap ma swoją checklistę. Zero wyjątków.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5998",
  "sender": "5967412834"
}
```

Modena jest obecnie wrzucona do bazy wg tego standardu?
assistant: Sprawdzam co wiem o Modenie i czy jest już w strukturze.
assistant: **Modena jest w bazie, ale NIE zgodnie ze złotym standardem.**

Oto porównanie:

---

## ✅ Co jest dobrze
| Pole | Status |
|------|--------|
| SKU | `GWN-MODENA-160` (jest, ale...) |
| slug | `lozko-modena-pojemnik-hydrofobowa` ✓ |
| price | `regular/sale/currency` ✓ |
| attributes.dimensions | Są (width/length/height) ✓ |
| seo | Tytuł i description są ✓ |

---

## ❌ Co trzeba przerobić

### 1. **SKU i warianty (NAJWAŻNIEJSZE)**
**Teraz:** Jeden produkt = jeden SKU `GWN-MODENA-160`, a w opisie informacja "dostępne 180×200, 200×200"

**Złoty standard:**
```json
{
  "sku": "GWN-MODENA",
  "variants": [
    {"variantId": "v-160", "sku": "GWN-MODENA-160", "attributes": {"size": "160x200"}},
    {"variantId": "v-180", "sku": "GWN-MODENA-180", "attributes": {"size": "180x200"}},
    {"variantId": "v-200", "sku": "GWN-MODENA-200", "attributes": {"size": "200x200"}}
  ]
}
```

### 2. **Brak struktury `names`**
Teraz masz tylko `name`. Powinno być:
```json
"names": {
  "display": "Łóżko MODENA",
  "internal": "LOZKO MODENA TAPICEROWANE",
  "seo": "Łóżko tapicerowane MODENA z pojemnikiem | GAWIN24"
}
```

### 3. **Brak `media`**
Zero informacji o zdjęciach. Powinno być:
```json
"media": {
  "hero": {"imageId": "modena-hero-01", "alt": "..."},
  "gallery": [...]
}
```

### 4. **Brak `logistics` i `relationships`**
Brak info o gwarancji, typie dostawy, produktach komplementarnych.

### 5. **Kategorie są płaskie**
Masz: `"categories": ["Łóżka tapicerowane", "Meble do sypialni"]`

Powinno być:
```json
"category": {
  "primary": "lozko",
  "subcategory": "lozko-tapicerowane",
  "breadcrumbs": ["sypialnia", "lozka", "lozka-tapicerowane"]
}
```

---

## 🎯 Werdykt

Modena jest w starej strukturze **WooCommerce-like** (płaska, prosta), nie w nowej **JSON gold standard** (zagnieżdżona, systemowa).

**Migracja:** Musisz przerobić Modenę zgodnie ze schematem, który podałem wcześniej, albo:
1. Zrobić eksport obecnej bazy
2. Napisać skrypt konwertujący (stary format → złoty standard)
3. Zaimportować na nowo

Chcesz żebym przygotował skrypt migracji dla Modeny (i innych produktów z tego pliku)?
