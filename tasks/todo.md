# aura-notes redesign + optimization

## Plan
- [x] Audit current UI, UX friction points, and performance hotspots in `public/index.html`
- [x] Apply premium minimal visual system refinements (spacing/radius/shadow/contrast)
- [x] Harden markdown rendering security (sanitize HTML output)
- [x] Optimize note open flow to avoid full list rerender on every read action
- [x] Improve accessibility baseline (reduced motion support)
- [x] Run build/index verification and basic smoke checks

## Review
- Removed parser typo in script include (`marked` tag had extra `>`).
- Added DOMPurify sanitization for markdown HTML before render.
- Added HTML render cache to reduce repeated parse cost.
- Reduced unnecessary rerenders when opening notes (only rerender list when unread mode demands it).
- Fixed focus toggle logic to be deterministic.
- Added reduced-motion media query for accessibility and smoother UX.
