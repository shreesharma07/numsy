// Builds an offline subset of the Phosphor icon set (Iconify "ph" collection)
// containing only the icons referenced in src/ as "ph:<name>". The site then
// never calls the Iconify API at runtime.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, '..', 'src');
const outFile = join(srcDir, 'generated', 'phosphor-icons.json');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === 'generated' ? [] : walk(p);
    return /\.(tsx?|mts)$/.test(name) ? [p] : [];
  });

const used = new Set();
for (const file of walk(srcDir)) {
  for (const m of readFileSync(file, 'utf8').matchAll(/['"`]ph:([a-z0-9-]+)['"`]/g)) used.add(m[1]);
}

const set = require('@iconify-json/ph/icons.json');
const icons = {};
const missing = [];
for (const name of [...used].sort()) {
  const alias = set.aliases?.[name];
  const key = set.icons[name] ? name : alias?.parent;
  if (!key || !set.icons[key]) {
    missing.push(name);
    continue;
  }
  icons[name] = set.icons[key];
}
if (missing.length) {
  console.error(`[build-icons] unknown Phosphor icons: ${missing.join(', ')}`);
  process.exit(1);
}
const subset = { prefix: 'ph', width: set.width ?? 256, height: set.height ?? 256, icons };
// src/generated is git-ignored, so a clean checkout (e.g. Cloudflare's build) starts without it
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(subset, null, 2)}\n`);
console.log(
  `[build-icons] ${Object.keys(icons).length} Phosphor icons -> src/generated/phosphor-icons.json`,
);
