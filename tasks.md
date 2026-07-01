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
- [x] Fix type exploration mobile overflow and add responsive breakpoints.
- [x] Raise mobile tap targets and safe-area spacing where fixed controls or dense headers need it.
- [x] Replace `100vh`-only screens with `dvh`-safe sizing on mobile-facing pages.
- [x] Make sea touch dragging strong enough to explore all islands on mobile.
- [x] Extend visual smoke checks to catch mobile overflow and cover the type exploration page; make cross-platform (remove Windows Edge hard-code).

## Phase 3 - Hosting/security hardening
- [ ] Move custom headers to a host that supports them; GitHub Pages ignores `_headers`.
- [ ] Serve immutable cache headers for versioned assets.
- [ ] Replace runtime `new Function` path with a static build/prerender when feasible; removes `unsafe-eval`/`unsafe-inline` CSP requirements and the 2.98 MB Babel liability.
- [x] Vendor third-party runtime scripts locally or remove runtime dependency.

## Phase 4 - Production readiness (from 2026-07-01 review)
- [x] Add `.nojekyll` to prevent GitHub Pages Jekyll processing.
- [x] Create on-brand `404.html` so bad URLs stay inside the artist's world.
- [x] Add `<noscript>` crawlable content block — poems, bio, performances — so search engines and no-JS visitors see real content.
- [x] Remove editor copy from production modals ("drag a new image onto the frame to swap it").
- [x] Add `lang="tnq"` to Taíno/Arawak native-language poem stanzas for correct screen-reader pronunciation.
- [x] Trap Tab focus within open modals so keyboard users cannot drift to background content.
- [x] Delete `al colibri.dc.html` (stale editor duplicate with wrong canonical URL); fix Archive's back-link to point to `./`.
- [x] Fix Archive.dc.html JSON-LD `about.url` (pointed to editor file instead of canonical root).
- [x] Remove authoring artifacts from the deployed site: `uploads/`, `.thumbnail`, and committed screenshot PNGs deleted; `screenshots/.gitignore` kept so smoke output stays untracked.
- [x] Normalize production URLs: `Archive.dc.html` → `archive.html`, `Colibrí - Type Exploration.dc.html` → `type-exploration.html`; instant-redirect pages left at old paths; all internal links and sitemap updated.
- [ ] Move hosting to a platform that serves `_headers` (Cloudflare Pages / Netlify), or add Cloudflare in front of GitHub Pages to apply HSTS, CSP, and immutable cache headers.

## Later, only if needed
- [x] Replace archive Vimeo iframes with click-to-load poster cards.
- [x] Self-host/subset fonts.
- [x] Add automated visual smoke checks for desktop and mobile.
- [ ] Add per-poem static pages for SEO and shareability.
- [ ] Add privacy-friendly analytics (e.g. Plausible) to measure reach.
- [x] Preload first-fold hero WebP + primary fonts stylesheet in `index.html` `<head>` to reduce render-blocking.
