# al colibrí — design & build document

**An artist site for the poet/visual-work practice of al colibrí.**

**For** the build team — Claude Code (architecture), Claude Design (aesthetics), and the UX layer between them.
**Status** New build, Phase 2. No existing prototype. This is the foundational document.
**Relationship to the other site** None, publicly. See *Identity & boundaries*. Do not reference, link to, or surface the professional site (jordanloewencolon.com) anywhere. The two are separate worlds.

---

## The one-paragraph brief

al colibrí is a hummingbird's-eye website. Not a set of pages but a **sea you drift across** — a Caribbean archipelago where each piece of work is an island you hover over, the way the bird the site is named for moves flower to flower. The visitor wanders, loops, and gets a little lost, but the loss is enchantment, not a trap — there is always a way home. Behind the drifting surface sits a quiet engine: a backend that lets the artist add poems, images, video, and (later) audio and essays, and position them in the constellation. The aesthetic is Basquiat — raw, primary, hand-made — with sun-bleached tropical splashes breaking the seriousness. The mood is mystical, spiritual, playful. A waterfall, not a locked door.

---

## How to read this document

The site is specified in **three layers**, matched to three builders. Each layer can be worked somewhat independently, but they share contracts where they meet. Build order and dependencies are at the end.

1. **Architecture** — the technical skeleton and the backend. *Claude Code's domain.* What the site is made of, how content is stored and served, how the artist edits it.
2. **Aesthetics** — the visual language. *Claude Design's domain.* Color, type, the hummingbird, the texture and feel of every surface.
3. **UX / Motion** — the experience between architecture and aesthetics. How the drift works, how motion behaves, how a visitor moves through the constellation and always finds the exit.

A note on the seams: the most important coordination is that **architecture must expose content in a way that aesthetics and motion can treat as free-floating objects.** Build the data model so a "piece" (poem, image, video) is a self-contained node that can be positioned anywhere in 2D space, shown in any visual mode, and animated independently. Everything downstream depends on that.

---

# LAYER 1 · ARCHITECTURE

*Claude Code's domain. The skeleton and the engine.*

## The core metaphor, technically

The site is a **constellation / archipelago**: a non-linear 2D space where content pieces are positioned as islands. This is not a paginated site with a nav menu. It's closer to a map you pan across, or a starfield you drift through. The architecture must support:

- A 2D coordinate space (the "sea") larger than the viewport, that the visitor moves across.
- Content "islands" positioned at coordinates within that space.
- Non-linear movement — drift, pan, zoom, or hover-to-approach, depending on what the UX layer decides (see Layer 3). The architecture provides the spatial model; the UX layer provides the movement feel.
- A persistent way home / way out from anywhere (the exit floor — see Layer 3).

> [!NOTE]
> **Technical approach is the dev's call**, but candidates: a pannable canvas (HTML/CSS transforms on a large positioned container), a lightweight WebGL/canvas scene if motion demands it, or an SVG coordinate space. Start with the simplest thing that delivers smooth drift and can hold ~5–30 islands without performance issues. Reserve WebGL for if the motion spec (Layer 3) genuinely requires it.

## Content model

Everything on the site is a **piece** (an island). Pieces share a common structure so the constellation can treat them uniformly, with a `type` field driving how each renders.

```
Piece {
  id
  type          // "poem" | "visual" | "video" | "audio" | "essay"
  title         // may be hidden in display; always present for the dashboard
  body          // poem text, essay text — null for pure-visual pieces
  media         // image / video / audio asset reference — null for text-only
  position      // { x, y } in the constellation space
  size          // visual weight in the constellation (some islands larger)
  status        // "draft" | "published"
  order         // for any sequence views
  taino_text    // optional Taíno-language fragment attached to the piece
  created
  updated
}
```

**Content types and their launch status:**

| Type | At launch | Notes |
|---|---|---|
| `poem` | 3–5 live | The core. Must support multiple display modes (see Layer 3, "poem encounter"). |
| `visual` | Some live | Film essays, video-game work. Image or embedded media. |
| `video` | Some live | Film essays may be video. Embedded or hosted. |
| `audio` | Empty, build the type | Spoken word, Taíno meditations. Coming later — the type must exist and render, even if no pieces yet. |
| `essay` | Empty, build the type | Non-academic reflections, meditations, fiction. Coming later — same: build the capability now. |

> [!IMPORTANT]
> **Build for the empty types now.** Audio, essays, and the eventual 40th-birthday photoshoot do not exist at launch but are coming within a year. The data model, the dashboard, and the rendering must accommodate them from day one so adding them later is *content entry*, not a *rebuild*. The photoshoot is likely a `visual` collection — consider whether `visual` needs to support multi-image galleries, not just single images.

## The backend / admin panel

**Medium-weight custom admin panel.** Not a flat-file system (too fiddly for regular updates), not a heavy third-party CMS (overkill). A login-protected dashboard the artist uses to manage the constellation.

Required capabilities:

- **Add / edit / delete pieces** of any type via a form (title, body, media upload, Taíno fragment).
- **Draft / publish states.** Work-in-progress stays invisible to visitors until published. This matters — al colibrí is a *studio and a gallery*; the artist needs to stage things privately.
- **Reordering / repositioning.** The artist sets where each island sits in the constellation. Ideally a visual placement tool (drag the island on a map of the sea); at minimum, editable x/y coordinates.
- **Image / media upload.** Direct upload, not URL-pasting. Handles the photoshoot, visual art, audio files.
- **Preview.** See a piece (and its placement) as it will appear, before publishing.
- **Multiple poem display modes** settable per poem or globally (see Layer 3) — the dashboard should let the artist choose or experiment with how a given poem is encountered.

> [!NOTE]
> **Suggested stack** (dev's discretion): a static or server-rendered front end with a headless content layer the dashboard writes to. Options range from a hosted headless CMS with a custom front end, to a small custom admin with a lightweight database. Authentication can be simple (single-user, the artist). No need for multi-user roles, comments, or workflow — one person, publishing when they feel like it.

## Identity & boundaries (architectural enforcement)

These are not just content choices — some must be enforced at the architecture level:

- **No analytics.** No Google Analytics, no Plausible, no tracking pixels, no cookies, no consent banner. The site collects nothing. Build it clean.
- **No legal name anywhere** — not in content, not in metadata, not in the page `<title>`, not in the HTML comments, not in the repo's public-facing strings. The site's identity is "al colibrí," full stop. (Internal repo names are fine; public output is not.)
- **No link to the professional site**, in either direction, anywhere.
- **No social integrations**, no share buttons, no Open Graph cards designed for social spread. The site is found by word of mouth, not by algorithm.
- **Domain:** `alcolibri.com`.
- **Discoverability:** This is a separate world. Consider whether the site should even be indexed by search engines — a `noindex` directive is worth discussing with the artist. (A site "only people you tell will find" may want to stay out of search results entirely.)

## Performance & hosting

- The drift must be **smooth** — 60fps panning, no jank. This is a felt-quality site; stutter breaks the spell.
- Media (images, video, audio) must be optimized and lazy-loaded so the constellation loads fast and pieces stream in as approached.
- Hosting: a static/JAMstack host (Netlify, Vercel) if the architecture allows; a small server if the backend requires it. The dev chooses based on the admin-panel approach.

---

# LAYER 2 · AESTHETICS

*Claude Design's domain. The visual language.*

## The governing aesthetic

**Basquiat, with sun-bleached tropical splashes.** Raw, primary, hand-made, urgent. Not polished, not corporate, not minimal-tasteful. The site should feel like it was *made by hand* — crowns, scrawl, layered marks, the seam left visible. Then, breaking the rawness: faded tropical color, the bleached Kodachrome of an old Caribbean photograph, that lets the playfulness and warmth in.

This is **deliberately the opposite of the professional site.** Where jordanloewencolon.com is a calm Caribbean-night document, al colibrí is a loud, primary, hand-made object. They must not look like siblings-in-palette. The only thing they share is the person behind them and (eventually) the hummingbird mark.

## Color

**Spine — Basquiat primaries:**

| Role | Direction | Notes |
|---|---|---|
| Ground | Canvas-cream / raw unprimed | Not white. The color of unprimed canvas or aged paper — warm, slightly dirty. |
| Black | Raw, brushy black | Not pure `#000`. An ink/charcoal black that feels applied, not digital. |
| Cadmium yellow | Loud, saturated | The Basquiat yellow. Used boldly. |
| Oxblood / cadmium red | Deep, urgent | Reds that feel like paint. |
| Ultramarine | Vivid blue | The crown blue. |

**Splashes — faded DTMF tropical:**

| Role | Direction | Notes |
|---|---|---|
| Sun-bleached pink | Faded, nostalgic | Plena pink, washed out like an old photo. |
| Ocean teal | Soft, watery | The tropical counter to the primaries. |

**Usage philosophy:** Unlike the professional site (one disciplined accent at a time), al colibrí *can clash, vibrate, and overwhelm.* Multiple loud colors in one view is permitted and encouraged. The primaries carry the energy; the faded tropicals are the splash of difference that keeps it from being only aggressive — they let the mystical/playful register in.

> [!NOTE]
> Final hex values are Claude Design's call, pulled from real Basquiat reference and real faded-Kodachrome reference. The directions above are the spine; the designer tunes the exact tones.

## Typography

The professional site is Fraunces / Source Serif 4 / JetBrains Mono — restrained, editorial. **al colibrí should not inherit this.** The artist site wants type with edge and personality.

Directions (designer's call on specifics):

- **Display / titles:** something with real character — a distressed serif, a brutalist grotesque, hand-lettering, or a display face pushed to extremes. The quirks the professional site suppressed (Fraunces WONK, exaggerated forms) are *welcome* here.
- **Poems:** the typeface must serve the line. Poetry doesn't need a workhorse body face; it needs type chosen for how it sits on the page as a visual object. May differ from the display face or may be the same face used differently.
- **Taíno fragments:** the threaded Taíno text (see Layer 3) may warrant its own treatment — a different weight, color, or face — so it reads as a distinct voice within the English.

**Type behavior:** Unlike the professional site (stable, never breaks a word), al colibrí's type *can* break the grid, overlap, rotate, run off the edge, layer over images. The poem dictates the layout. Type is part of the visual art, not just a delivery mechanism.

## The hummingbird

The hero image, the recurring motif, and effectively the site's identity. **The artist is making it** (not AI-generated — this was a firm decision; the mark must be authored by the artist or a Taíno artist, never machine-generated, consistent with the artist's own position on Indigenous cultural imagery).

Aesthetic requirements:

- It is **the hero** — the first major image, the thing the site is built around.
- It is a **recurring motif** — appears in multiple places, becomes the visual signature.
- It is effectively the **logo / identity** — the whole site *is* the hummingbird.
- Style should sit inside the Basquiat-primary world — it can be raw, marked, primary-colored, hand-made. Not a clean vector logo; a made thing.

> [!IMPORTANT]
> **The hummingbird asset comes from the artist and is on the critical path.** The site cannot reach final form without it. Build the architecture and the surrounding aesthetic with a placeholder, but the real mark must arrive before launch. Its *animation behavior* is specified in Layer 3.

## Texture & surface

Basquiat is layered, marked, worked. Consider (designer's call):

- Visible texture in the ground — canvas grain, paper tooth, the sense of a physical surface.
- Hand-made marks — scrawl, underline, crossing-out, crowns, arrows — as recurring graphic elements, drawn (by the artist) not generated.
- Layering — the sense that things sit *on top of* other things, with depth and overlap, rather than in a flat clean grid.

This is the texture that makes it feel made-by-hand rather than templated. It must come from real marks (the artist's hand) — same provenance discipline as the hummingbird.

---

# LAYER 3 · UX / MOTION

*The layer between architecture and aesthetics. How it feels to move through.*

## The core experience: drift with a floor

**Wandering, looping, disorienting — but always with a clear exit.** The visitor drifts through the constellation the way a hummingbird moves through a garden: hovering, darting, never quite settling, following nectar from island to island. They may not always know exactly where they are. That's intended — it's enchantment, the pleasure of a beautiful space you explore without a map.

**But the disorientation has a floor.** From anywhere in the constellation, the visitor can always:

- Get home (return to the entrance / a known anchor point).
- Get out (a clear, persistent way to leave or reset the view).

This is the single most important UX rule: **the wander is a garden you can always walk out of, never a maze you're trapped in.** The exit must be present, discoverable, and calm — not hidden as part of the puzzle. A small persistent element (the hummingbird itself? a home-mark?) that always returns the visitor to safety.

## The entrance: loading into bloom

The first thing a visitor sees is a **loading-into-bloom moment.** The site doesn't just appear — it *blooms* into being. Possible reading (designer + dev to realize together): a closed or seed-like state that opens, unfurls, comes alive — petals, color, the hummingbird arriving — resolving into the constellation. The entrance sets the spell. It should feel like crossing a threshold into a living place, not loading a webpage.

This is a designed moment, not a spinner. Give it weight. A held breath before the garden opens.

## Motion: tides and the hummingbird

**Motion is the soul of this site.** The reference images the artist gave: *the tides*, and *the hummingbird moving flower to flower.* The motion language:

- **Drift** — slow, tidal movement. Things float, breathe, sway gently even at rest. Nothing is perfectly still. The whole sea has a slow pulse, like water.
- **Hovering** — the hummingbird's signature. Quick arrivals, suspended hovering, sudden darts. Where the tides are slow, the hummingbird is quick — the contrast between the two motion speeds is the texture.
- **Fades** — transitions are soft, dissolving, watery. Things fade in and out rather than cutting. Approaching an island brings it into focus like coming up on it through water.

**Mood:** mystical, spiritual, playful. A waterfall — continuous, alive, mesmerizing, with the white-noise calm of moving water. Not anxious motion, not aggressive motion. The motion should feel *good to sit inside.*

> [!NOTE]
> **Performance is a felt-quality requirement here, not just a technical one.** Janky motion destroys the waterfall feeling instantly. The architecture (Layer 1) and the motion (Layer 3) must coordinate: if the motion spec demands more than CSS transforms can smoothly deliver, the architecture goes to canvas/WebGL. Smooth drift is non-negotiable.

## The hummingbird's animation — experiment

The artist explicitly wants to **experiment with the hummingbird's animation.** This is a place to prototype, not to lock a single answer at the spec stage. Build the capability to try several, and let the artist feel which fits:

- **A still mark that recurs** — the simplest; the hummingbird as a returning visual signature, not animated.
- **A hummingbird that moves through the site** — hovers, darts between islands, leads the visitor from piece to piece, appears and disappears.
- **The cursor as hummingbird** — the visitor's own movement *is* the bird; the cursor becomes the hummingbird, and moving through the sea is flying.
- **The hummingbird as the home/exit anchor** — it's always present, and returning to it is how you get home (ties motion to the exit floor).

Prototype 2–3 of these. The "flower to flower" image suggests genuine motion (not just a static mark), and the hovering-between-islands or cursor-as-bird directions feel closest to the brief — but let the artist see them moving before deciding.

## Poem encounter — a designed experiment

The artist wants to **see** how poems feel in multiple modes before committing. Build poems to be presentable in several ways, with the ability to switch — per poem, or as prototyped variants the artist compares:

- **One per page, full screen** — the poem alone, nothing else, full immersion.
- **Scrolling sequence** — poems flowing one into the next as you move.
- **Typeset as image / visual object** — the poem as a designed visual artifact, type-as-art, possibly layered with marks or the hummingbird.

The dashboard (Layer 1) should let the artist set or experiment with a poem's display mode. This is a real "try it and feel it" requirement, not a pick-one-now decision — the architecture must support all three so the artist can compare them live.

## Language as texture

**Mostly English, with hints of Taíno threaded throughout.** The Taíno is not translated-and-explained (no glossary, no hover-definitions — that would violate "no explaining"). It's woven in as texture and presence — a word, a phrase, a fragment attached to a piece, a title. The Taíno appears the way the hummingbird appears: recurring, signature, present without justification.

This connects to the mood: the Taíno fragments are part of the mystical/spiritual register. They're not a language lesson; they're incantation, presence, the artist's heritage threaded through the work as the work, not as commentary on the work. Treat them visually as a distinct voice (Layer 2 typography note) so they register as their own thread within the English.

## What the experience refuses

The site's refusals, enforced at the UX level:

- **No selling.** No shop, no prices, no "buy," no commission inquiry forms, no CTA of any kind. The art solicits nothing.
- **No social links.** No icons, no follow, no share. The site does not point outward to platforms.
- **No explaining.** No artist statement that justifies the work, no "about the project," no captions that decode. The work stands unexplained. (A piece may have a title and a Taíno fragment; it does not get an interpretation.)
- **No analytics.** Nothing is tracked. The visitor is unobserved.

These refusals define al colibrí more than any feature. On an artist site, what it won't do is the statement.

---

# BUILD ORDER & SEAMS

## Dependencies

```
Architecture (Layer 1) ──┬── must expose pieces as free-floating,
                         │   positionable, mode-agnostic nodes
                         │
                         ├──> Aesthetics (Layer 2) styles the nodes
                         │     and the surfaces
                         │
                         └──> UX/Motion (Layer 3) moves the nodes
                               and the visitor through them

Hummingbird asset (artist) ──> required by Layer 2 (hero, motif)
                               and Layer 3 (animation experiments)

Taíno fragments (artist) ──> threaded through Layers 2 & 3
```

## Suggested sequence

1. **Architecture skeleton + content model** (Claude Code). The constellation space, the piece data model, the empty-but-built content types. Get a pannable sea with placeholder islands drifting before anything is styled.
2. **Backend / admin panel** (Claude Code). The artist can add, position, draft, and publish pieces. Test by entering the 3–5 real poems and the existing visual work.
3. **Aesthetic language** (Claude Design). Color, type, texture, surfaces — applied to the islands and the sea. The hummingbird placeholder becomes the real mark when the artist delivers it.
4. **Motion + entrance** (UX layer, Code + Design together). The drift, the tidal movement, the loading-into-bloom entrance, the fades. The felt quality.
5. **Hummingbird animation experiments** (together). Prototype 2–3 behaviors; the artist chooses.
6. **Poem-mode experiments** (together). Build all three display modes; the artist compares and decides per poem or globally.
7. **The exit floor** (UX). Verify from every point in the constellation the visitor can get home and get out. Calmly.

## What the artist still owes the build

- **The hummingbird mark** — authored by the artist or a Taíno artist, never AI-generated. On the critical path for final form.
- **Hand-made marks / textures** (if Layer 2's texture direction is pursued) — same provenance.
- **The 3–5 poems** and the existing visual/film/game work, for content entry.
- **Taíno fragments** — the words and phrases threaded through.
- **Decisions, after seeing prototypes:** which hummingbird animation, which poem mode(s), final color tuning.

---

## A closing note on what this site is

al colibrí is the opposite kind of object from the professional site, on purpose. The professional site sells considered judgment to people writing checks; it is a document, and it earns trust by being legible, fast, and disciplined. al colibrí sells nothing. It is an object — a living, drifting, hand-made, mystical thing that a person finds, wanders into, gets a little lost in, and remembers. Its success is not a booking. Its success is that someone hovers a while, like the bird, and carries it with them after they leave.

Build it strange. Build it beautiful. Build it so the visitor can always find their way back out — and so they don't want to, just yet.

*— End of document.*
