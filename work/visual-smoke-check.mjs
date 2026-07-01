/**
 * Visual smoke check — captures screenshots of every public page at desktop
 * and mobile widths so regressions are easy to spot before deployment.
 *
 * Usage:  node work/visual-smoke-check.mjs
 * Output: screenshots/smoke/  (gitignored)
 *
 * Requires Node 18+ and a Chromium/Chrome/Edge installation. Detected
 * automatically per platform — set BROWSER_PATH env var to override.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'screenshots', 'smoke');

// ── Browser discovery ────────────────────────────────────────────────────────
const BROWSER_CANDIDATES = {
  linux: [
    '/opt/pw-browsers/chromium',         // Playwright pre-installed (CI / claude.ai/code)
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/snap/bin/chromium',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
};

async function findBrowser() {
  if (process.env.BROWSER_PATH) return process.env.BROWSER_PATH;
  const candidates = BROWSER_CANDIDATES[process.platform] ?? BROWSER_CANDIDATES.linux;
  for (const p of candidates) {
    try {
      await fs.access(p, fsConstants.X_OK);
      return p;
    } catch {}
  }
  throw new Error(
    `Could not find a Chromium/Chrome/Edge binary.\n` +
    `Tried:\n  ${candidates.join('\n  ')}\n` +
    `Set BROWSER_PATH=/path/to/browser to override.`
  );
}

// ── Local dev server ─────────────────────────────────────────────────────────
const server = spawn('python3', ['-m', 'http.server', '4174'], {
  cwd: root,
  stdio: 'ignore',
});

const stop = () => { if (!server.killed) server.kill(); };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });
process.on('SIGTERM', () => { stop(); process.exit(143); });

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4174/');
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Local server did not start in 10 s');
}

// ── Screenshot helper ─────────────────────────────────────────────────────────
async function shot(browser, name, url, width, height) {
  const file = path.join(outDir, name);
  const profileDir = path.join(root, 'screenshots', '.smoke-profiles', name.replace(/\.png$/, ''));
  await fs.mkdir(profileDir, { recursive: true });

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    `--virtual-time-budget=6000`,
    `--user-data-dir=${profileDir}`,
    `--screenshot=${file}`,
    `--window-size=${width},${height}`,
    url,
  ];

  const proc = spawn(browser, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Browser exited ${code}`)));
  });

  const stat = await fs.stat(file);
  if (stat.size < 50_000) throw new Error(`Screenshot suspiciously small (${stat.size} bytes): ${name}`);
  console.log(`  ✓ ${name} (${(stat.size / 1024).toFixed(0)} KB)`);
}

// ── Overflow detection ────────────────────────────────────────────────────────
// Takes a narrow screenshot and checks whether the resulting PNG is wider than
// the requested viewport (indicates horizontal overflow / content escape).
async function checkOverflow(browser, pageName, url, mobileWidth = 390) {
  const name = `${pageName}-overflow-check.png`;
  const file = path.join(outDir, name);
  const profileDir = path.join(root, 'screenshots', '.smoke-profiles', name.replace(/\.png$/, ''));
  await fs.mkdir(profileDir, { recursive: true });

  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    `--virtual-time-budget=6000`,
    `--user-data-dir=${profileDir}`,
    `--screenshot=${file}`,
    `--window-size=${mobileWidth},2400`,
    url,
  ];
  const proc = spawn(browser, args, { stdio: 'ignore' });
  await new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Browser exited ${code}`)));
  });

  const buf = await fs.readFile(file);
  const pngWidth = buf.readUInt32BE(16);
  if (pngWidth > mobileWidth + 2) {
    throw new Error(
      `OVERFLOW on ${pageName} mobile: page rendered at ${pngWidth}px wide (viewport: ${mobileWidth}px)`
    );
  }
  console.log(`  ✓ ${pageName} mobile no overflow (${pngWidth}px)`);
  await fs.unlink(file).catch(() => {});
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const browser = await findBrowser();
  console.log(`Browser: ${browser}`);

  await waitForServer();
  console.log('Server ready. Taking screenshots…\n');

  const base = 'http://127.0.0.1:4174';

  // Desktop screenshots
  await shot(browser, 'home-desktop.png',             `${base}/`,                     1440, 1400);
  await shot(browser, 'archive-desktop.png',          `${base}/archive.html`,         1440, 1800);
  await shot(browser, 'type-exploration-desktop.png', `${base}/type-exploration.html`,1440, 1400);

  // Mobile screenshots
  await shot(browser, 'home-mobile.png',              `${base}/`,                     390, 1200);
  await shot(browser, 'archive-mobile.png',           `${base}/archive.html`,         390, 1800);
  await shot(browser, 'type-exploration-mobile.png',  `${base}/type-exploration.html`,390, 1400);

  // Mobile overflow checks
  console.log('\nOverflow checks…');
  await checkOverflow(browser, 'home',              `${base}/`);
  await checkOverflow(browser, 'archive',           `${base}/archive.html`);
  await checkOverflow(browser, 'type-exploration',  `${base}/type-exploration.html`);

  console.log(`\nAll checks passed. Screenshots in: ${outDir}`);
}

main()
  .then(() => { stop(); process.exit(0); })
  .catch((err) => { console.error('\n✗', err.message); stop(); process.exit(1); });
