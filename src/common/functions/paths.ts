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

/**
 * Scratch space for the legacy upload/ZIP endpoints: <os tmp>/numsy, or NUMSY_WORK_DIR.
 * Kept out of the working directory so `numsy dashboard` never litters the folder it runs in.
 */
export const workDir = (...parts: string[]): string =>
  path.join(process.env.NUMSY_WORK_DIR || path.join(os.tmpdir(), 'numsy'), ...parts);
