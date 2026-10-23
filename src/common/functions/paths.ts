/**
 * Locations inside the installed package (work from src/ under ts-node and from dist/)
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * The package root: the directory holding package.json
 */
export const packageRoot = (): string => path.resolve(__dirname, '..', '..', '..');

/**
 * Static pages shipped in public/
 */
export const publicDir = (): string => path.join(packageRoot(), 'public');

/**
 * The built dashboard (dist/dashboard), or null when it has not been built
 */
export function dashboardDir(): string | null {
  const dir = path.join(packageRoot(), 'dist', 'dashboard');
  return fs.existsSync(path.join(dir, 'index.html')) ? dir : null;
}

let privateDir: string | undefined;

/**
 * Scratch space for the legacy upload/ZIP endpoints, kept out of the working directory so
 * `numsy dashboard` never litters the folder it runs in. NUMSY_WORK_DIR when set; otherwise a
 * private directory created once per process by fs.mkdtempSync (mode 0700, unpredictable name),
 * so other users of a shared machine can't pre-create or symlink it. It is removed on exit.
 */
export function workDir(...parts: string[]): string {
  if (process.env.NUMSY_WORK_DIR) return path.join(process.env.NUMSY_WORK_DIR, ...parts);
  if (!privateDir) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'numsy-'));
    privateDir = dir;
    process.once('exit', () => fs.rmSync(dir, { recursive: true, force: true }));
  }
  return path.join(privateDir, ...parts);
}
