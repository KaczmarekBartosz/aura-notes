# Lessons

- Single-file HTML+JS was too fragile for this app scale; modular React architecture reduces regression risk.
- Mobile Safari table rendering must be handled with explicit overflow strategy (`min-width` + horizontal scroll) and safe word wrapping.
- For deploy reliability, always keep `main` and deploy branch (`master`) in sync and verify remote SHA.
- Auth/data source must be local/deploy-coherent (`/.netlify/functions/notes`), not external dead endpoints.
