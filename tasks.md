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
- [x] Investigated replacing runtime `new Function` with a static build/prerender: not feasible without rewriting the vendored `support.js` runtime. The template engine itself doesn't eval; only the Component-class loader (`evalDcLogic`) and the unused lazy-JSX/Babel importer do. `unsafe-eval` stays in the CSP as an accepted limitation (see Phase 5).
- [x] Vendor third-party runtime scripts locally or remove runtime dependency.

## Phase 4 - Production readiness (from 2026-07-01 review)
- [x] Add `.nojekyll` to prevent GitHub Pages Jekyll processing.
- [x] Create on-brand `404.html` so bad URLs stay inside the artist's world.
- [x] Add crawlable content block — poems, bio, performances — so search engines and no-JS visitors see real content. (Later upgraded from `<noscript>`-only to an always-present fallback removed on successful mount — see Phase 5.)
- [x] Remove editor copy from production modals ("drag a new image onto the frame to swap it").
- [x] Add `lang="tnq"` to Taíno/Arawak native-language poem stanzas for correct screen-reader pronunciation.
- [x] Trap Tab focus within open modals so keyboard users cannot drift to background content.
- [x] Delete `al colibri.dc.html` (stale editor duplicate with wrong canonical URL); fix Archive's back-link to point to `./`.
- [x] Fix Archive.dc.html JSON-LD `about.url` (pointed to editor file instead of canonical root).
- [x] Remove authoring artifacts from the deployed site: `uploads/`, `.thumbnail`, and committed screenshot PNGs deleted; `screenshots/.gitignore` kept so smoke output stays untracked.
- [x] Normalize production URLs: `Archive.dc.html` → `archive.html`, `Colibrí - Type Exploration.dc.html` → `type-exploration.html`; instant-redirect pages left at old paths; all internal links and sitemap updated.
- [ ] Move hosting to a platform that serves `_headers` (Cloudflare Pages / Netlify), or add Cloudflare in front of GitHub Pages to apply HSTS, CSP, and immutable cache headers.

## Phase 5 - Advanced optimization (ready to implement)
- [x] Add `width`/`height` attributes to all `<image-slot>` elements to prevent cumulative layout shift (CLS).
- [x] Fix WCAG AA color-contrast failures: teal tag/caption text (#3F8278, 3.30:1 against sand) and brand red (#BC2E1C, 4.35:1) both failed the 4.5:1 threshold for normal text. Darkened to #2C6960 (4.68:1) and #B82D1B (4.50:1) — visually near-identical, only `color:` glyph declarations touched, decorative borders/shadows untouched.
- [x] **Crawlable + crash-resilient fallback content** — converted the `<noscript>` block into an always-present `#nc` div (full poems/bio/performances), removed only by `componentDidMount()` once the sea actually mounts. Covers no-JS visitors *and* any future runtime error — the exact failure mode that broke island drift on 2026-07-01 (a bad template expression threw during render, after `<x-dc>` had already been replaced with an empty mount div, leaving a blank page with no fallback). Superseded `work/prerender.mjs` (deleted): that approach would have injected static markup directly into the live `<sc-for>` template, risking permanent duplicate content once hydrated, and didn't address the crash case at all.
- [x] **Investigated removing `unsafe-eval` from CSP via prerendering** — not achievable this way. The DC runtime's template engine (`compileTemplate`/`resolve`) doesn't eval; the only two `new Function` call sites are `evalDcLogic` (the artist's `<script type="text/x-dc" data-dc-script>` Component class) and the unused lazy JSX/Babel importer. Dropping eval would mean rewriting how the vendored `support.js` (generated from `dc-runtime/src/*.ts`) loads the Component class — out of safe scope for a prerender pass. Tracked as an accepted limitation in Phase 3.
- [ ] **Per-poem static pages** — See `POEM_PAGES_GUIDE.md`. Create `/poems/{slug}.html` for each poem (5 pages). Improves SEO and social sharing. Template provided.

## Later, only if needed
- [x] Replace archive Vimeo iframes with click-to-load poster cards.
- [x] Self-host/subset fonts.
- [x] Add automated visual smoke checks for desktop and mobile.
- [x] Preload first-fold hero WebP + primary fonts stylesheet in `index.html` `<head>` to reduce render-blocking.
- [ ] Add privacy-friendly analytics (e.g. Plausible) to measure reach.
