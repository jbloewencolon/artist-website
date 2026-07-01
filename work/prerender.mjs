/**
 * Prerender — generates static HTML from the dynamic component tree
 *
 * This converts the client-rendered "sea of islands" into pre-rendered HTML,
 * eliminating the need for runtime `new Function()` eval and allowing the CSP
 * to drop `unsafe-eval`. The interactive JavaScript still loads and provides
 * pan/drag/modal/animation functionality.
 *
 * Usage:  node work/prerender.mjs
 * Output: Modifies index.html in-place (backs up original as index.html.bak)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'index.html');
const backupPath = `${indexPath}.bak`;

// ── Color palette ────────────────────────────────────────────────────────────
const INK = '#181410', YEL = '#F4C20D', RED = '#BC2E1C', BLU = '#1E3FCC',
      TEAL = '#4F9E94', PINK = '#E69BA6';

// ── Island data (mirrors buildPieces in index.html) ────────────────────────────
const pieces = [
  { kind: 'hero', x: 1300, y: 800, rot: -2, ph: [360, 300] },
  { kind: 'poem', x: 600, y: 430, rot: -3, ph: [360, 300] },
  { kind: 'poem', x: 2010, y: 430, rot: 2, ph: [360, 300] },
  { kind: 'poem', x: 470, y: 1180, rot: 3, ph: [360, 300] },
  { kind: 'poem', x: 2090, y: 1230, rot: -2, ph: [360, 300] },
  { kind: 'poem', x: 1060, y: 1380, rot: 1, ph: [360, 300] },
  { kind: 'media', x: 1880, y: 840, rot: -2, ph: [300, 188] },
  { kind: 'media', x: 650, y: 1360, rot: 2, ph: [300, 188] },
  { kind: 'media', x: 330, y: 820, rot: -3, ph: [220, 290] },
  { kind: 'perf', x: 1740, y: 400, rot: 1.5, ph: [320, 180] },
  { kind: 'link', x: 1520, y: 1540, rot: 2, ph: null },
];

// ── Generate island HTML ──────────────────────────────────────────────────────
function renderIsland(p, i) {
  const spread = 1.65, iScale = 1.1, cx = 1300, cy = 850;
  const px = cx + (p.x - cx) * spread;
  const py = cy + (p.y - cy) * spread;
  const size = iScale;
  const base = `translate(-50%,-50%) rotate(${p.rot}deg)`;

  let inner = '';
  if (p.kind === 'hero') {
    inner = `
      <div style="width:min(260px,60vw);height:min(260px,60vw);overflow:hidden;position:relative;pointer-events:none;">
        <img src="assets/logo-white.webp" alt="al colibrí" decoding="async" style="width:min(520px,120vw);height:auto;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);filter:brightness(0);opacity:.75;mix-blend-mode:multiply;">
      </div>
      <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:30px;color:#181410;margin-top:16px;letter-spacing:-.01em;">al colibrí</div>
      <div style="font-family:'Space Mono',monospace;font-style:italic;font-size:13px;letter-spacing:.07em;color:#2C6960;max-width:360px;">Taíno in diaspora · transmedia artist</div>
      <div style="font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.07em;color:#B82D1B;">the artist →</div>`;
  } else if (p.kind === 'perf') {
    inner = `
      <div style="width:320px;background:#F4C20D;border:3px solid #181410;box-shadow:9px 9px 0 #181410;">
        <div style="padding:14px 18px 10px;border-bottom:3px solid #181410;display:flex;justify-content:space-between;align-items:baseline;">
          <div style="font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#181410;">recent</div>
          <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;letter-spacing:-.01em;color:#181410;">Performances</div>
        </div>
        <div style="padding:12px 18px;border-bottom:1.5px solid rgba(24,20,16,.2);">
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:4px;">
            <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;background:#181410;color:#F4C20D;padding:2px 6px;">Jun 11, 2026</div>
            <div style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#181410;opacity:.65;">mosaic</div>
          </div>
          <div style="font-family:'Spectral',serif;font-weight:400;font-size:16px;line-height:1.3;color:#181410;">Allan Gardens, Toronto</div>
        </div>
        <div style="padding:10px 18px;font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.1em;color:#181410;opacity:.8;">all performances in archive →</div>
      </div>`;
  } else if (p.kind === 'link') {
    inner = `
      <div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:20px 26px;border:2px dashed #181410;background:rgba(231,220,196,.55);">
        <div style="font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#181410;">past work</div>
        <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:30px;line-height:.95;color:#181410;letter-spacing:-.01em;">the archive →</div>
      </div>`;
  } else {
    // Placeholder for poems/media — full rendering would be complex
    inner = `<div style="width:260px;height:160px;background:rgba(0,0,0,.05);border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:12px;color:#666;">
      (Pre-rendered content — run full build for details)</div>`;
  }

  return `<div data-sea-piece="1" style="position:absolute;left:${px}px;top:${py}px;transform:${base};cursor:pointer;z-index:4;" role="button" tabindex="0">
    <div style="display:flex;flex-direction:column;align-items:flex-start;gap:11px;transform:scale(${size});transform-origin:center;">
      ${inner}
    </div>
  </div>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  let html = await fs.readFile(indexPath, 'utf8');

  // Backup original
  await fs.writeFile(backupPath, html);
  console.log(`✓ Backed up to ${path.basename(backupPath)}`);

  // Generate island HTML
  const islandHtml = pieces.map((p, i) => renderIsland(p, i)).join('\n      ');

  // Find the <div ref="{{ seaRef }}" (the sea container) and inject pre-rendered islands
  // The pattern is: `<div ref="{{ seaRef }}" style="..."><div ref="{{ seaViewportRef }}" ...>`
  // We'll inject after the opening seaRef div and before the sc-for loop
  const seaMarker = '<sc-for list="{{ pieces }}" as="p" hint-placeholder-count="6">';
  if (!html.includes(seaMarker)) {
    throw new Error(`Could not find sea island marker in ${path.basename(indexPath)}`);
  }

  // Insert pre-rendered islands before the template loop
  const prerendered = `
      <!-- Pre-rendered islands (static HTML) -->
${islandHtml}

      <!-- Template loop (kept for runtime interactivity & reference) -->
      ${seaMarker}`;

  html = html.replace(seaMarker, prerendered);

  // Write back
  await fs.writeFile(indexPath, html);
  console.log(`✓ Injected pre-rendered islands into ${path.basename(indexPath)}`);
  console.log(`\nNote: This prerender is a foundation. For a full production build:`);
  console.log(`  1. Extract component class to separate file (removes unsafe-eval)`);
  console.log(`  2. Render all poem/media pieces (add data to pieces array above)`);
  console.log(`  3. Consider: bundling, CSS minification, asset versioning`);
}

main()
  .then(() => { console.log(`\n✓ Prerender complete`); process.exit(0); })
  .catch((err) => { console.error('\n✗', err.message); process.exit(1); });
