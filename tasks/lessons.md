# Lessons

- For recurring tool-access workflows, never rely on chat-memory assumptions. Use deterministic wrappers and local checks first.
- In UI-heavy single-file apps, avoid full rerenders on per-item selection; update only affected DOM where possible.
- Always sanitize rendered markdown/HTML in client apps, even for "trusted" internal content.
