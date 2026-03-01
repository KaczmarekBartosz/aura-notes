---
title: "Workflow: Wizualizacje mebli (Nano Banana Pro)"
subcategory: "workflows"
category: "ai-agents"
tags: ["ai", "automation"]
type: "note"
created: "2026-02-01"
updated: "2026-02-01"
source: "manual"
ai_generated: false
---

# Workflow: Wizualizacje mebli (Nano Banana Pro)

## Sprawdzony prompt

```
Replace only the white background with a realistic, professional e-commerce scene that naturally complements this furniture piece. Keep the furniture itself, its position, angle, lighting, shadows, and all original details completely unchanged. Create a lifestyle setting that enhances the product appeal while maintaining photorealistic quality.
```

## Parametry

- **Resolution:** 2K (najlepszy balans jakości/czasu)
- **Tryb:** Edycja z flagą `-i` (input image)
- **Efekt:** Mebel zachowany 1:1, tło zmienione na lifestyle scene

## Użycie

```bash
uv run /path/to/generate_image.py \
  --prompt "Replace only the white background..." \
  --filename "output.png" \
  --resolution 2K \
  -i "input.jpg"
```

## Notatka

> "Wyniki tego prompta są świetne. Meble są bdb odwzorowane." — Bartek, 2025-02-11

Sprawdzone na 29 meblach. Działa idealnie.
