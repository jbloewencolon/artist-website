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

## Phase 6 - Mobile: restore & harden (from 2026-08-18 mobile audit)
Quick, low-risk, no redesign. See `MOBILE_UX_AUDIT.md` for full writeups (F-numbers below).
- [x] Reinstate the first-visit drag hint as its own isolated commit, so it can't be swept up
      in an unrelated revert again (F1). Touch-aware copy via `pointer:coarse` was already
      designed in commit `7af161b` before it was accidentally reverted in `5add280`.
- [x] Enlarge the modal close button ("drift back ↩") to a real 44×44px tap area via padding,
      not just text (F4).
- [x] Verify/adjust the home-anchor control so its visual pieces read as tappable, not just the
      combined hit area (F8).
- [x] Bump undersized UI-label font sizes (tags, cues, metadata) at the ≤480px breakpoint (F6).
- [x] Convert remaining fixed-pixel card/frame widths (perf card, media frames) to
      `min(Npx, calc(100vw - Xpx))`, matching the pattern already used for the hero mark and
      entrance heading (F5).
- [x] Add a `box-shadow`-based fade fallback alongside the `mask-image` poem-preview fade for
      browsers without mask-image support, gated behind `@supports not (...)` (F10).

## Phase 7 - Mobile: wayfinding & escape hatches (from 2026-08-18 mobile audit)
Interaction design, moderate effort — the site's core discoverability gap on mobile.
- [ ] Give mobile a persistent, always-visible way to leave the spatial "sea" for a linear list
      of poems/archive — not just the keyboard-only `.skip-link` (F2). The existing `#nc` linear
      content block is a strong starting point for what this view should contain.
- [ ] Add a lightweight "you are here" cue (edge fade, dot trail, or minimal minimap) so mobile
      users can sense how much of the world remains unexplored and in which direction (F3, F7).
- [ ] Add an explicit way to see more of the world at once on mobile — e.g. double-tap-to-recenter
      or a "zoom out" control — since `touch-action:none` removes native pinch-zoom entirely (F7).

## Phase 8 - Mobile: viewport-adaptive spatial scale (from 2026-08-18 mobile audit)
The one structural change. Larger effort — design + engineering + re-validation together.
- [ ] Make the packed-world scale (`spread`, `islandScale`, or an equivalent radius passed into
      `packIslands()`) responsive to viewport width, so phones see a denser, faster-to-explore
      cluster instead of inheriting the desktop world size (F3).
- [ ] Re-tune `packIslands()`'s `GAP`/`GRAVITY` constants for the compressed mobile canvas so
      islands don't feel cramped once brought closer together.
- [ ] Re-validate touch drag distance/multiplier and the seed → bloom → sea entrance pacing at
      the new mobile scale — both were tuned against the current, larger world.

## Phase 9 - Mobile: verification & regression-proofing (from 2026-08-18 mobile audit)
- [ ] Extend `work/visual-smoke-check.mjs` beyond the single 390px width to include 360px
      (common Android baseline) and 428px (Pro Max-class), plus one landscape pass (F9).
- [ ] Manual on-device pass (iOS Safari + Android Chrome) focused on `100dvh`/safe-area behavior
      against the collapsing Safari toolbar, `mask-image` fallback rendering, and drag ergonomics
      — screenshots alone won't catch this class of bug (F9).
- [ ] Re-run the WCAG contrast pass on any new UI introduced in Phases 6-8, since the existing
      fix only covered the pre-existing teal/red text.
