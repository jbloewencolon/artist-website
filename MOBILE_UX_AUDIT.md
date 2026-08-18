# Mobile UX Audit — al colibrí

**Repository:** `jbloewencolon/artist-website`
**Site:** https://alcolibri.com
**Reviewed:** 2026-08-18
**Reviewer role:** Senior mobile product designer / UX strategist / front-end architect
**Scope:** Mobile experience only — `index.html` (the "sea"), `archive.html`, `type-exploration.html`

---

## 1. Executive Summary

**Verdict: Mobile-functional, not yet mobile-designed.** The site has already been through
substantial mobile *hardening* — five prior optimization phases (`tasks.md`) covered responsive
images, self-hosted fonts, `dvh`-safe sizing, safe-area insets, touch-drag tuning, and WCAG
contrast fixes. Nothing here is broken in the sense of overflow, crashes, or illegible text.

What's missing is mobile *interaction design*. The site's core idea — a full-viewport "sea" of
draggable islands — is a desktop-native metaphor (built for a mouse, hover states, and a wide
field of view) that has been made to *work* on a touchscreen without being *rethought* for one.
The gap shows up in three places: **discoverability** (nothing tells a first-time mobile visitor
that dragging is the whole interface), **wayfinding** (no way to sense how much content exists or
where it is), and **scale** (the explorable world is the same physical size on a 390px phone as
on a 1440px desktop, so mobile visitors do far more work to see the same content).

None of this should mean abandoning the "sea" concept — it's the site's identity, and the archive
page proves the team already knows how to build a completely conventional, mobile-excellent linear
page when the content calls for it. The recommendation throughout this audit is to keep the sea
exactly as it is for visitors who want it, and build the missing on-ramps and escape hatches
around it for the ones who don't yet know how to use it, or would rather not.

---

## 2. What's Already Working (mobile-specific)

- **Touch-aware drag tuning.** `pointer:coarse` detection scales drag distance 2.25× and raises
  the move-vs-tap threshold to 8px vs. 6px on mouse — real, deliberate touch ergonomics work
  (`index.html` `onSeaTouchMove`, `onPointerMove`).
- **`100dvh` + safe-area handling.** A dedicated `@media (max-width:680px)` block repositions
  every fixed UI element (skip link, wordmark, home anchor, close button) around
  `env(safe-area-inset-*)`, and the sea itself uses `height:100dvh` with a `100vh` fallback.
- **The archive page is genuinely mobile-well-designed.** Single-column poem grid under 680px,
  explicit `min-height:44px` touch targets on every toggle/link, safe-area-aware padding. This is
  the bar the rest of the site should be held to.
- **Fluid type where it counts.** Hero wordmark, entrance heading, and modal poem body all use
  `clamp()` rather than fixed sizes.
- **`prefers-reduced-motion` is honored everywhere** — drift, parallax, bloom, and pulse animations
  all collapse to static, which also happens to remove a common source of mobile motion-sickness
  complaints.
- **A complete, linear, standard-HTML fallback already exists** (`#nc`, removed on successful
  mount). It was built for crawlers/no-JS/crash-resilience, but it is — structurally — exactly the
  "browse as a list" alternative a mobile visitor who doesn't want to drag would need. Right now
  it's invisible to anyone whose JS *does* run. See Finding 2.

---

## 3. Findings

### 🔴 High impact

**F1 — Regression: the first-visit drag hint was silently deleted.**
Commit `7af161b` added a dismissible "press + drag" hint (touch-aware copy via
`matchMedia('(pointer: coarse)')`) specifically to orient first-time visitors to the drag
interaction — the single most valuable affordance on mobile, where nothing else signals that the
"sea" beyond the hero is pannable. Commit `5add280` ("Revert to original logo-white watermark")
reverted the *entire* diff introduced by `7af161b` — including the unrelated drag hint — because
both changes shipped in one commit. Today, a first-time mobile visitor taps "drift in →" and lands
in a full-bleed draggable canvas with zero indication that dragging exists or is necessary.
*Verified: no `drag-hint`/`showDragHint` reference remains anywhere in `index.html`.*

**F2 — No touch-discoverable escape hatch from the spatial metaphor.**
The only linear alternative is `.skip-link` ("skip to archive"), which is positioned off-screen
(`transform:translateY(-180%)`) and only becomes visible on `:focus` — a keyboard-only affordance.
A touch user cannot see or tap something that only appears on focus. Combined with F1, a mobile
visitor who doesn't intuit "drag" has **no discoverable way** to reach the poems, archive, or bio.
The `#nc` fallback content (see §2) is architecturally the answer, but it's only ever shown when
the sea *fails* to mount, not offered as a deliberate choice.

**F3 — World scale doesn't adapt to viewport; mobile inherits the desktop drag distance.**
`spread` (1.65) and `islandScale` (1.1) are fixed props, independent of viewport width. The sea is
always packed into the same ~2600×1700 CSS-px world (`packIslands()`, `index.html:347-393`). On a
~390px-wide phone that's roughly 7× the viewport width — visitors need many more successive drags
to reach the same 11 pieces a desktop visitor covers in 2–3. The touch drag multiplier (F-adjacent,
2.25×) offsets this partially but doesn't reduce how many islands sit outside the initial view or
the resulting disorientation of not knowing which direction to drag.

**F4 — Modal close target is undersized and thumb-hostile.**
"drift back ↩" (`index.html:242`) is a bare text button with no declared padding, fixed at
`top:30px;right:34px` — under the 44×44px touch-target guideline, and in the hardest corner to
reach one-handed on a large phone. The backdrop is click-to-close too, which helps, but a
full-length poem in a scrollable panel can occupy the entire reachable tap-outside area.

### 🟡 Medium — polish & robustness

**F5 — Fixed-pixel cards inside the draggable world don't have a systematic viewport floor.**
The performance card (`width:320px`) and several media frames (e.g. 300×188, 360×420) aren't
expressed as `min(Npx, calc(100vw - Xpx))` the way the hero mark and entrance heading already are
(`min(260px,60vw)`, `clamp(56px,11vw,140px)`). Fine today on 360–430px phones with ~15px margins
to spare, but accidental, not designed-in.

**F6 — UI micro-copy sits at 10–13px, letter-spaced for a larger point size.**
Tag labels, "read the full poem →" cues, and performance metadata are legible but tight at arm's
length on a phone. Not a WCAG failure (none of this is body copy) but worth a small bump at
≤480px, mirroring the treatment already applied to the entrance tagline.

**F7 — No pinch/zoom-out affordance for the spatial canvas.**
`touch-action:none` on the sea viewport (`index.html:67`) suppresses native pinch-zoom entirely —
necessary so a pinch doesn't zoom the whole page instead of panning the canvas — but nothing
replaces it. Mobile visitors get a permanently "zoomed in" view of a world that's proportionally
larger than their screen (see F3), with no way to see more of it at once.

**F8 — Home-anchor tap target reads smaller than its actual hit area.**
The "home" control (`index.html:185-188`) wraps a 40px circle and an 11px label in one clickable
flex column, so the *combined* target likely clears 44px, but each visual piece looks smaller than
that — low confidence for the user that they've hit the right spot. Low severity; verify on-device.

### 🟢 Low / verification

**F9 — Smoke-test coverage is a single mobile width.**
`work/visual-smoke-check.mjs` only checks overflow at 390px (`checkOverflow(..., mobileWidth =
390)`). No pass at 360px (common Android baseline) or 428px (Pro Max-class), and no landscape
orientation or on-device check of `100dvh` behavior against iOS Safari's collapsing toolbar —
screenshots alone won't catch that class of bug.

**F10 — `mask-image` fade-outs have no fallback.**
The poem-preview text fade (`index.html:136`) uses `-webkit-mask-image`/`mask-image` with no
plain-`overflow:hidden` fallback. Historically uneven support on older Android WebView/Samsung
Internet; cheap insurance to add a fallback.

**F11 — `type-exploration.html` is a style-reference page, not visitor content.**
It's already mobile-tested per `tasks.md`, but it's the densest, least mobile-natural content on
the site. Confirm it isn't prioritized in `sitemap.xml`/crawl weight and isn't a likely mobile
landing page.

---

## 4. Recommended Priority

The findings above map to concrete phases in `tasks.md` (Phase 6–9), ordered so the highest
user-impact, lowest-risk fixes ship first, and the one genuinely structural change (F3's
viewport-adaptive world scale) is scoped as its own phase with its own validation pass.
