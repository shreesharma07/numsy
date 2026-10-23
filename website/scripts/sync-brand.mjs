// Copies the canonical brand assets (../assets/brand) into public/brand so the
// site always ships the same files the README uses. Output is git-ignored.
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'assets', 'brand');
const dest = join(here, '..', 'public', 'brand');

if (!existsSync(src)) {
  console.error(`[sync-brand] missing ${src}`);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
const files = readdirSync(src).filter((f) => /\.(svg|png|jpe?g)$/i.test(f));
for (const f of files) copyFileSync(join(src, f), join(dest, f));
console.log(`[sync-brand] ${files.length} files -> public/brand`);
