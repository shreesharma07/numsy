#!/usr/bin/env node

/**
 * Verify the npm tarball contents before publishing
 * Fails when build output is missing or when repo-only folders (website, sources, docs) would ship
 * Usage: node scripts/verify-package.js   (run after `pnpm build`)
 */

const { execSync } = require('node:child_process');

const REQUIRED = [
  'package.json',
  'README.md',
  'LICENSE',
  'dist/index.js',
  'dist/index.d.ts',
  'dist/cli/index.js',
  'dist/cli/server.js',
  'dist/core/Parser.js',
  'dist/core/Parser.d.ts',
  'public/index.html',
];

const FORBIDDEN = [
  { pattern: /^website\//, reason: 'documentation website' },
  { pattern: /^src\//, reason: 'TypeScript sources' },
  { pattern: /^test\//, reason: 'tests' },
  { pattern: /^docs\//, reason: 'repository docs' },
  { pattern: /^assets\//, reason: 'brand assets' },
  { pattern: /^scripts\//, reason: 'maintainer scripts' },
  { pattern: /\.map$/, reason: 'source maps' },
  { pattern: /\.tgz$/, reason: 'nested package tarball (semantic-release tarballDir)' },
  { pattern: /(^|\/)node_modules\//, reason: 'node_modules' },
];

const [pack] = JSON.parse(
  execSync('npm pack --dry-run --json --ignore-scripts', { encoding: 'utf-8' }),
);
const files = pack.files.map((file) => file.path.replace(/\\/g, '/'));

const missing = REQUIRED.filter((file) => !files.includes(file));
const leaked = files.flatMap((file) => {
  const rule = FORBIDDEN.find(({ pattern }) => pattern.test(file));
  return rule ? [`${file} (${rule.reason})`] : [];
});

console.log(
  `📦 ${pack.name}@${pack.version}: ${files.length} files, ${(pack.size / 1024).toFixed(1)} kB packed`,
);

if (missing.length || leaked.length) {
  for (const file of missing) console.error(`✖ missing: ${file}`);
  for (const file of leaked) console.error(`✖ must not ship: ${file}`);
  process.exit(1);
}

console.log('✔ tarball contains the build output and nothing from website/, src/, test/ or docs/');
