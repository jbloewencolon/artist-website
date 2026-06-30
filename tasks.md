# Site optimization tasks

## Phase 1 - Critical, no visual redesign
- [x] Keep root URL usable for GitHub Pages visitors.
- [x] Add passive SEO/accessibility/security audit fixes from roadmap.
- [x] Space sea islands so cards do not crowd each other.
- [x] Stop raw template placeholders from causing wasted 404 image requests.
- [x] Stop public pages from fetching missing editor sidecar state.
- [x] Add favicon to prevent browser `favicon.ico` 404.

## Phase 2 - Snappier mobile/performance work
- [x] Move font discovery into the real document head before runtime boot.
- [x] Generate smaller WebP variants for large portfolio images.
- [x] Wire `image-slot` to `srcset`/`sizes` so mobile gets smaller images.
- [x] Reduce repeated sea layout work during modal open/close.
- [x] Keep Vimeo embeds lazy and verify playback after changes.

## Phase 3 - Hosting/security hardening
- [ ] Move custom headers to a host that supports them; GitHub Pages ignores `_headers`.
- [ ] Serve immutable cache headers for versioned assets.
- [ ] Replace runtime `new Function` path with a static build/prerender when feasible.
- [x] Vendor third-party runtime scripts locally or remove runtime dependency.

## Later, only if needed
- [x] Replace archive Vimeo iframes with click-to-load poster cards.
- [x] Self-host/subset fonts.
 - [x] Add automated visual smoke checks for desktop and mobile.
