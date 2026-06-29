import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(root, 'screenshots', 'smoke');
const server = spawn('python', ['-m', 'http.server', '4174'], {
  cwd: root,
  stdio: 'ignore',
  windowsHide: true,
});

const stop = () => {
  if (!server.killed) server.kill();
};

process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });
process.on('SIGTERM', () => { stop(); process.exit(143); });

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4174/');
      if (res.ok) return;
    } catch {
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Local server did not start');
}

async function shot(name, url, size) {
  const file = path.join(outDir, name);
  const profileDir = path.join(root, 'screenshots', '.smoke-profiles', name.replace(/\.png$/, ''));
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--virtual-time-budget=5000',
    `--user-data-dir=${profileDir}`,
    `--screenshot=${file}`,
    `--window-size=${size}`,
    url,
  ];
  const proc = spawn(edge, args, { stdio: 'inherit', windowsHide: true });
  const code = await new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('exit', resolve);
  });
  if (code !== 0) throw new Error(`Screenshot failed: ${name}`);
  const stat = await fs.stat(file);
  if (stat.size < 100_000) throw new Error(`Screenshot too small: ${name}`);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  await waitForServer();
  await shot('home-desktop.png', 'http://127.0.0.1:4174/', '1440,1400');
  await shot('home-mobile.png', 'http://127.0.0.1:4174/', '390,1100');
  await shot('archive-desktop.png', 'http://127.0.0.1:4174/Archive.dc.html', '1440,1800');
  await shot('archive-mobile.png', 'http://127.0.0.1:4174/Archive.dc.html', '390,1400');
}

main()
  .then(() => {
    stop();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    stop();
    process.exit(1);
  });
