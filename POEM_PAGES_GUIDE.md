# Per-Poem Static Pages — Implementation Guide

**Goal:** Create dedicated pages for each poem (e.g., `/poems/the-ancestors.html`) for SEO, shareability, and discoverability. Each page embeds the full poem text, metadata, and navigation back to the sea.

---

## Why per-poem pages?

1. **Search engine indexing** — Search engines can fully crawl and index individual poems at stable URLs
2. **Social media sharing** — Direct links show poem title + excerpt in link previews
3. **Citation & linking** — Readers can reference specific works with stable URLs
4. **Long-tail SEO** — "Taíno poetry" + poem title combinations become discoverable
5. **No JavaScript required** — Poem text exists in served HTML (graceful degradation)

---

## Structure

Each poem gets its own page at `/poems/{slug}.html`:

```
/poems/
  the-ancestors.html          # ka hebeyo'no
  discovery-day.html          # arawak
  black-squirrel-rhythm.html   # february
  gimme-that-swamp-song.html   # bayou
  ode-to-small-gods.html       # cemís
```

---

## Template

Use this as a starting point. Adapt colors and titles per poem:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Ancestors — al colibrí</title>
<meta name="description" content="ka hebeyo'no — a poem by Taíno diaspora poet al colibrí. Read the full text of this meditation on ancestral kinship and lineage.">
<link rel="canonical" href="https://alcolibri.com/poems/the-ancestors.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="The Ancestors — al colibrí">
<meta property="og:description" content="ka hebeyo'no — a poem by al colibrí">
<meta property="og:url" content="https://alcolibri.com/poems/the-ancestors.html">
<meta property="og:image" content="https://alcolibri.com/assets/mural.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="The Ancestors — al colibrí">
<meta name="twitter:description" content="ka hebeyo'no">
<meta name="twitter:image" content="https://alcolibri.com/assets/mural.jpg">

<!-- Schema.org CreativeWork -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "The Ancestors",
  "author": {"@type": "Person", "name": "al colibrí", "url": "https://alcolibri.com/"},
  "url": "https://alcolibri.com/poems/the-ancestors.html",
  "description": "ka hebeyo'no — a poem about ancestral kinship",
  "inLanguage": ["en", "tnq"],
  "datePublished": "2026-06-01",
  "text": "[Full poem text here]"
}
</script>

<link rel="icon" href="../assets/logo-white.webp" type="image/webp">
<link href="../assets/site-fonts.css" rel="stylesheet">
<style>
  html,body{margin:0;padding:0;background:#E7DCC4;color:#181410;font-family:'Spectral',Georgia,serif;}
  *{box-sizing:border-box;}
  :focus-visible{outline:3px solid #1E3FCC;outline-offset:4px;box-shadow:4px 4px 0 #F4C20D;}
  .poem-wrap{max-width:680px;margin:0 auto;padding:52px 28px 80px;}
  .poem-nav{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#181410;margin-bottom:56px;}
  .poem-nav a{color:#BC2E1C;text-decoration:none;border-bottom:1px solid #BC2E1C;}
  .poem-tag{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#3F8278;margin-bottom:12px;}
  .poem-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:48px;line-height:.95;letter-spacing:-.02em;margin:0 0 32px;}
  .poem-native{font-style:italic;color:#3F8278;white-space:pre-wrap;line-height:1.8;margin:0 0 20px;font-size:19px;}
  .poem-divider{height:2px;width:54px;background:#181410;opacity:.35;margin:0 0 24px;}
  .poem-body{font-weight:300;font-size:21px;line-height:1.8;white-space:pre-wrap;color:#181410;margin:0 0 48px;}
  .poem-meta{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.1em;color:#3F8278;opacity:.8;margin-top:56px;padding-top:20px;border-top:1px solid rgba(24,20,16,.2);}
  .poem-footer{margin-top:56px;padding-top:20px;border-top:2px solid #181410;text-align:center;}
  .poem-footer a{font-family:'Space Mono',monospace;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#BC2E1C;text-decoration:none;border-bottom:1px solid #BC2E1C;}
  @media (max-width:680px){
    .poem-wrap{padding:32px 20px 60px;}
    .poem-title{font-size:36px;}
    .poem-body{font-size:18px;}
  }
</style>
</head>
<body>
<div class="poem-wrap">

  <div class="poem-nav"><a href="../">← back to the sea</a></div>

  <div class="poem-tag">ka hebeyo'no</div>
  <h1 class="poem-title">The Ancestors</h1>

  <p class="poem-native" lang="tnq">Gua'arikawabu
Naiko aban
Hewibo hiana ka yuca
Ka kawia k'akirikatti
Wa itaa le bu abon'o
Wa eibun'no le bu kanowa
Axahawa a yoba kaya'no
Aita'ni yara le aba hamaka  bia'bu
Yaha alu ka inkayeke</p>

  <div class="poem-divider"></div>

  <p class="poem-body">We see you
Little one
Ripening like the yucca
The waxing pumpkin moon
Our blood is your rivers
Our bones are your canoe
Wander to many islands
Knowing there is a hammock for you
Here in the village</p>

  <div class="poem-meta">
    <p>© al colibrí — all rights reserved</p>
  </div>

</div>

<div class="poem-footer">
  <a href="../">← back to the sea</a>
</div>

</body>
</html>
```

---

## Implementation Steps

### 1. Create the directory
```bash
mkdir -p poems
```

### 2. Generate individual pages
For each poem, use the template above and customize:
- `<title>` — Poem title + artist
- `<meta name="description">` — Tag + brief description
- `canonical` URL — `/poems/{slug}.html`
- Open Graph `og:url` — same as canonical
- `<h1>` — poem title
- `.poem-tag` — Taíno tag / theme
- `.poem-native` — native-language stanza (if any) with `lang="tnq"`
- `.poem-body` — full English text

### 3. Add schema.org metadata
The example includes `CreativeWork` schema. Fields to customize per poem:
- `name` — poem title
- `url` — canonical URL
- `description` — one-line summary
- `datePublished` — if known (use a reasonable estimate otherwise)
- `text` — the full poem text (helps schema indexing)

### 4. Update sitemap
Add entries to `sitemap.xml`:
```xml
<url>
  <loc>https://alcolibri.com/poems/the-ancestors.html</loc>
  <lastmod>2026-07-01</lastmod>
  <changefreq>yearly</changefreq>
  <priority>0.7</priority>
</url>
```

### 5. Link from the sea
In `index.html`, update poem pieces to link to the individual pages:
```javascript
{ kind: 'poem', ..., href: 'poems/the-ancestors.html', ... }
```

Or keep both — link poem **text** to the individual page, and keep the "sea" as a discovery interface.

---

## Accessibility & UX Considerations

- **Color coding**: Each poem can use its own accent color (already defined in `index.html` pieces)
- **Back navigation**: Every page has a clear "← back to the sea" link
- **Keyboard navigation**: Test with Tab, Enter on focus-visible elements
- **Reduced motion**: The pages are static HTML, so animations aren't an issue
- **Font sizing**: Use `clamp()` for responsive typography (see main site patterns)

---

## SEO Benefits

Once all poem pages exist:
- **Internal linking**: The sea links to individual poems; each poem links back → strong topical cluster
- **Multiple entry points**: Readers can find poems via Google, then explore other works
- **Semantic markup**: Schema.org `CreativeWork` signals to search engines
- **Social sharing**: Each poem gets its own shareable, embeddable link

---

## Example: Per-poem colors (from `index.html`)

```
The Ancestors         → #1E3FCC (blue)      — tag "ka hebeyo'no"
Discovery Day         → #BC2E1C (red)       — tag "arawak"
Black Squirrel Rhythm → #4F9E94 (teal)      — tag "february"
Gimme That Swamp Song → #F4C20D (yellow)    — tag "bayou · published"
Ode to the Small Gods → #E69BA6 (pink)      — tag "cemís"
```

Use these as accent colors for the page header bar, focus states, or links.

---

## Future Enhancements

- **Comment section** using Utterances or similar (gated, optional)
- **Related poems** — suggest similar works at the bottom
- **Audio readings** — embed an artist's reading of the poem
- **Translation notes** — explain Taíno language terms
- **Publication history** — if poems have been published elsewhere, link to those
- **Analytics** — track which poems are most read (privacy-friendly, e.g., Plausible)
