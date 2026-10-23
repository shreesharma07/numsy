import * as fs from 'node:fs';
import * as path from 'node:path';
import { packageRoot } from '../common/functions/paths';

/**
 * Reads the package version from package.json (works from src/ and dist/)
 */
export function readVersion(): string {
  try {
    return JSON.parse(fs.readFileSync(path.join(packageRoot(), 'package.json'), 'utf-8')).version;
  } catch {
    return '0.0.0';
  }
}
