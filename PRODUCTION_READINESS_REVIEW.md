# Production Readiness Review — al colibrí

**Repository:** `jbloewencolon/artist-website`
**Site:** https://alcolibri.com (GitHub Pages, custom domain via `CNAME`)
**Reviewed:** 2026-07-01
**Reviewer role:** Senior UX/UI + web/accessibility/security

---

## 1. Executive Summary

**Verdict: Partially ready — safe to keep live, but not yet "production-grade."**

This is a genuinely beautiful, distinctive artist site. The "drifting sea of islands"
concept, the Taíno-diaspora visual language, the poetry, and the craft in the interaction
design are strong and coherent. A visitor with a modern browser and JavaScript enabled gets
a polished, memorable experience, and the team has already worked through most of an
optimization backlog (`tasks.md`): responsive images, self-hosted fonts, vendored runtime,
reduced-motion support, lazy video, and accessibility affordances.

The gap between "looks finished" and "production-ready" comes down to three structural facts:

1. **All content is rendered client-side by JavaScript**, with no server-rendered or
   `<noscript>` fallback. For a *poet*, whose work is text, this is the single biggest risk:
   search engines, social-preview scrapers, and no-JS/assistive edge cases see an essentially
   empty page.
2. **The security and cache headers in `_headers` are not actually applied** — GitHub Pages
   ignores that file. The site's security posture today is aspirational, not active. (The team
   has correctly flagged this in `tasks.md` Phase 3.)
3. **Editor/authoring artifacts ship to production** — the `.dc.html` source files, an
   `uploads/` folder of raw source material, `tasks.md`, screenshots, and "drop an image to
   swap" UI copy are all publicly reachable.

None of these break the *experience* for a typical visitor, so the site can remain live. But
they meaningfully limit discoverability (the thing an artist site exists for) and leave the
hardening work unfinished. Address the "Must fix" list below and this moves cleanly to
**production-ready**.

---

## 2. Key Strengths

**Artist identity & art direction — excellent.** The aesthetic is confident and cohesive: the
sand/ink/blue/red/yellow/teal/pink palette, the neo-brutalist offset shadows, custom subset
fonts, floating petroglyph motifs, and the koyaha/irudahialo/karariwa entrance all reinforce a
clear point of view. The identity is *strong and unmistakable* — this review's recommendations
are all designed to preserve it.

**Accessibility is taken seriously (rare for an art site):**
- Skip link, `role="button"`/`role="dialog"`, `aria-modal`, and descriptive `aria-label`s throughout.
- Full keyboard support: Enter/Space activate pieces, Escape closes modals, focus is moved into
  the modal on open and **restored to the trigger on close** (`_lastFocus`).
- `:focus-visible` styling is defined and visible.
- `prefers-reduced-motion` is honored thoroughly — animations, parallax, float, and the entrance
  bloom all collapse to static.
- Images carry meaningful `alt` text; decorative grain is `aria-hidden`.

**Performance & delivery hygiene:**
- Responsive `srcset`/`sizes` with generated 480/960 WebP variants; `loading="lazy"` on media.
- Fonts self-hosted and subset (`assets/site-fonts.css`), no render-blocking third-party CDN.
- React/ReactDOM are **vendored locally with SRI integrity** — good supply-chain hygiene.
- Vimeo embeds are click/lazy-hydrated (`data-video-src`), not loaded upfront.
- `100dvh` + `env(safe-area-inset-*)` handling for modern mobile viewports.

**SEO metadata is well done** *(for the parts that don't depend on rendered content)*: canonical
URL, Open Graph, Twitter cards, JSON-LD `Person` schema, `sitemap.xml`, and `robots.txt` are all
present and correct.

**Security intent is present:** `_headers` defines HSTS, CSP, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, and frame protections — a strong baseline *if it were
being served* (see Risk #2).

---

## 3. Critical Risks and Gaps

### R1 — Content is 100% client-rendered; no-JS / crawlers see almost nothing *(highest impact)*
Every poem, the bio, performances, and links live inside the JavaScript component
(`buildPieces()` in `index.html`) and inside a `display:none` `<x-dc>` template. The visible DOM
before hydration is empty. There is **no `<noscript>` fallback**. Consequences:
- **Search engines** index little beyond the meta description — the poems themselves
  ("Gimme That Swamp Song," "The Ancestors," etc.) are effectively invisible to search. For a
  poet, this defeats a primary purpose of the site.
- **Social/link scrapers** that don't execute JS fall back only to the static OG tags.
- Any JS failure (blocked script, old device, network hiccup mid-load) yields a blank page with
  no graceful degradation.

### R2 — Security & cache headers are not applied in production
`CNAME` shows the site is on **GitHub Pages, which silently ignores `_headers`.** So HSTS, the
CSP, `X-Frame-Options`, and the `immutable` cache headers on `/assets` and `/uploads` are **not
actually in effect.** The security hardening exists on paper only. (Already tracked in
`tasks.md` Phase 3.)

### R3 — Runtime relies on `new Function()` eval + in-browser transpile posture
The component logic is evaluated with `new Function(...)` (`evalDcLogic`), and the runtime is
built to lazy-load **`babel-standalone` (2.98 MB)** for any JSX `x-import`. The current pages
don't trigger the Babel path, so today's page weight is fine — but the architecture *requires*
`script-src 'unsafe-inline' 'unsafe-eval'` in the CSP, which strips most of the CSP's real
protective value. A static prerender/build would remove both the eval requirement and the
2.98 MB liability. (Tracked in `tasks.md` Phase 3.)

### R4 — Authoring/editor artifacts are shipped publicly
- **`al colibri.dc.html` (57 KB)** is essentially the editor "source" duplicate of `index.html`,
  publicly reachable.
- **`uploads/Files and Images/`** exposes raw source material — original `.txt` poem files,
  Instagram-named `.jpg`s, and embed-link notes — at guessable URLs.
- `tasks.md`, `work/`, `screenshots/`, `.thumbnail`, and the `data-props` editor schema all ship
  to the live site.
- User-facing editor copy leaks: *"drag a new image onto the frame to swap it"* and
  *"drop an image"* placeholders appear in the production bio/image modals.

### R5 — Fragile / non-standard production URLs
Public pages use the **`.dc.html`** extension (`Archive.dc.html`) and **filenames with spaces**
(`al colibri.dc.html`, `Colibrí - Type Exploration.dc.html`), which require URL-encoding and are
awkward to share. There is **no `404.html`** and **no `.nojekyll`**, so GitHub Pages' default
Jekyll processing runs and unknown paths get GitHub's generic 404 rather than an on-brand one.

### R6 — Modal focus is not trapped; native-language text is unlabeled *(moderate a11y)*
Focus is moved into the dialog and restored on close (good), but **Tab is not trapped** inside
the open modal, so keyboard focus can drift to background content. Separately, Taíno/Arawak
"native" poem stanzas are rendered without a `lang`/`xml:lang` attribute, so screen readers
pronounce them with English rules.

---

## 7. Recommended Improvements

### 🔴 Must fix before production
1. **Ship crawlable, no-JS-visible content (R1).** Preserve the exact "sea" experience for JS
   users, but bake the real text into the served HTML so crawlers and no-JS visitors get it.
   Lowest-effort option: add a `<noscript>` block (or a visually-hidden but DOM-present layer)
   containing the poems, bio, and performance list as semantic HTML. Better long-term: a small
   prerender/build step (R3) that emits the content statically.
2. **Get the security headers actually served (R2).** Either (a) move hosting to a platform that
   honors `_headers`/custom headers (Cloudflare Pages, Netlify), or (b) if staying on GitHub
   Pages, front the domain with Cloudflare and apply HSTS/CSP/`X-Frame-Options` there. Keep
   `_headers` as the source of truth for whichever host reads it.
3. **Stop shipping authoring artifacts (R4).** Remove or exclude `al colibri.dc.html`, the
   `uploads/` source folder, `tasks.md`, `work/`, `screenshots/`, and `.thumbnail` from the
   deployed site, and remove the "drop/drag an image" editor copy from production modals. Confirm
   nothing user-facing links into `uploads/` first.
4. **Add `.nojekyll` and an on-brand `404.html` (R5).** Cheap, prevents Jekyll surprises, and
   keeps a wrong URL inside the artist's world instead of GitHub's default page.

### 🟡 Should fix soon
5. **Replace the runtime `new Function` path with a static build/prerender (R3)** so the CSP can
   drop `'unsafe-eval'` and (ideally) `'unsafe-inline'`, and the 2.98 MB Babel liability leaves
   the repo entirely.
6. **Trap focus within open modals and return `Tab`/`Shift+Tab` to the dialog (R6).**
7. **Normalize production URLs (R5):** rename `.dc.html` pages to clean paths (e.g.
   `/archive/`, `/type-exploration/`) with redirects, and eliminate spaces in filenames.
8. **Mark up native-language poem text** with `lang="agr"`/appropriate tags (R6) for correct
   screen-reader pronunciation.
9. **Finish the last open `tasks.md` item:** extend the visual smoke checks to cover mobile
   overflow and the Type Exploration page. Also make `work/visual-smoke-check.mjs`
   cross-platform — it currently hard-codes a Windows Edge path and won't run in CI/Linux.

### 🟢 Nice to have
10. Add a short **`README.md`** (how to run locally, deploy, edit content) and a **`LICENSE`**
    (or explicit "© al colibrí, all rights reserved" for the poems/art).
11. **Preload the first fold** (hero WebP + primary fonts) and add width/height or
    `aspect-ratio` on framed media to reduce layout shift.
12. **Analytics/consent-light telemetry** (e.g. privacy-friendly Plausible) so the artist can see
    reach — currently there's no measurement.
13. Provide a **static, linkable page per poem** (great for sharing individual works and for SEO),
    styled within the existing aesthetic.

---

## 9. Final Verdict

**Overall readiness: Partially ready.** The design, identity, and interaction craft are already
at a professional, ship-worthy level — the artist's voice is clear and strong, and nothing here
recommends diluting it. What's missing is the production *substrate*: the content needs to exist
for machines and no-JS clients, the security headers need to be genuinely served, and the
editor's scaffolding needs to stay out of the public build.

**Top three actions required before deployment:**
1. **Make the content crawlable and no-JS-visible** (add a `<noscript>`/prerendered content
   layer — the poems and bio must exist in served HTML).
2. **Serve the security headers for real** (move to, or front with, a host that honors
   `_headers` — Cloudflare/Netlify/Cloudflare-in-front-of-Pages).
3. **Strip authoring artifacts and non-standard URLs from production** (remove
   `al colibri.dc.html`, `uploads/` source, `tasks.md`, editor copy; add `.nojekyll` + a branded
   `404.html`).

Do these three and the site is ready to represent al colibrí in production — with the aesthetic
fully intact.
