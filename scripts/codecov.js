#!/usr/bin/env node
/**
 * Upload coverage (coverage/lcov.info) and test results (coverage/junit.xml) to Codecov.
 *
 *   pnpm test:ci && pnpm codecov
 *
 * The upload token comes from CODECOV_TOKEN in the environment (CI secret) or the repo-root
 * .env file (git-ignored). It is handed to the Codecov CLI through the environment only and is
 * masked in everything this script prints.
 *
 * The standalone Codecov CLI binary is downloaded once into node_modules/.cache/codecov-cli and
 * verified against its published SHA-256 checksum before it is run.
 */
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const COVERAGE = path.join(ROOT, 'coverage', 'lcov.info');
const JUNIT = path.join(ROOT, 'coverage', 'junit.xml');
const SLUG = 'shreesharma07/numsy';

/** Reads KEY=value lines from .env without printing anything */
function readDotEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const line of fs.readFileSync(file, 'utf-8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const token = process.env.CODECOV_TOKEN || readDotEnv().CODECOV_TOKEN;
const mask = (text) => (token ? text.split(token).join('***') : text);

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) fail(`Download failed (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Returns the path of a verified Codecov CLI binary for this platform */
async function codecovCli() {
  const target = { win32: 'windows/codecov.exe', darwin: 'macos/codecov', linux: 'linux/codecov' }[
    process.platform
  ];
  if (!target) fail(`No Codecov CLI binary for ${process.platform}; use "pip install codecov-cli"`);

  const dir = path.join(ROOT, 'node_modules', '.cache', 'codecov-cli');
  const binary = path.join(dir, path.basename(target));
  const sumFile = `${binary}.SHA256SUM`;

  if (!fs.existsSync(binary) || !fs.existsSync(sumFile)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`⇣ Downloading the Codecov CLI (${target})`);
    const base = `https://cli.codecov.io/latest/${target}`;
    fs.writeFileSync(sumFile, await download(`${base}.SHA256SUM`));
    fs.writeFileSync(binary, await download(base), { mode: 0o755 });
  }

  const expected = fs.readFileSync(sumFile, 'utf-8').trim().split(/\s+/)[0].toLowerCase();
  const actual = crypto.createHash('sha256').update(fs.readFileSync(binary)).digest('hex');
  if (expected !== actual) {
    fs.rmSync(binary, { force: true });
    fs.rmSync(sumFile, { force: true });
    fail('The Codecov CLI checksum does not match; the download was removed. Run again.');
  }
  return binary;
}

function run(binary, args) {
  const result = spawnSync(binary, args, {
    cwd: ROOT,
    encoding: 'utf-8',
    env: { ...process.env, CODECOV_TOKEN: token },
  });
  const output = mask(`${result.stdout ?? ''}${result.stderr ?? ''}`).trim();
  if (output) console.log(output.replace(/^/gm, '  '));
  return result.status === 0;
}

(async () => {
  if (!token) fail('CODECOV_TOKEN is not set. Add it to .env (git-ignored) or the environment.');
  for (const file of [COVERAGE, JUNIT]) {
    if (!fs.existsSync(file))
      fail(`${path.relative(ROOT, file)} is missing. Run "pnpm test:ci" first.`);
  }

  const cli = await codecovCli();
  const common = ['--git-service', 'github', '--slug', SLUG, '--disable-search'];

  console.log('⇡ Uploading coverage');
  const coverage = run(cli, ['upload-process', ...common, '--file', COVERAGE, '--flag', 'unit']);

  console.log('⇡ Uploading test results');
  const tests = run(cli, [
    'do-upload',
    '--report-type',
    'test_results',
    ...common,
    '--file',
    JUNIT,
  ]);

  if (!coverage || !tests) fail('Codecov upload failed (see the output above).');
  console.log('✔ Coverage and test results uploaded to Codecov');
})();
