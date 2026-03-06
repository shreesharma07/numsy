#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Quick fix for NPM 24-hour cooldown issue
 * This script bumps the version and commits with [skip ci]
 *
 * Usage: node scripts/fix-npm-cooldown.js [patch|minor|major]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const bumpType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error('❌ Invalid bump type. Use: patch, minor, or major');
  process.exit(1);
}

console.log('\n🔧 NPM Cooldown Quick Fix\n');
console.log('═══════════════════════════════════════\n');

try {
  // Read current version
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version;

  console.log(`📌 Current version: ${currentVersion}`);
  console.log(`🔄 Bumping ${bumpType} version...\n`);

  // Bump version without git tag
  const result = execSync(`npm version ${bumpType} --no-git-tag-version`, {
    encoding: 'utf-8',
  });

  const newVersion = result.trim().replace('v', '');
  console.log(`✅ Version bumped to: ${newVersion}\n`);

  // Stage changes
  console.log('📝 Staging changes...');
  execSync('git add package.json pnpm-lock.yaml', { stdio: 'inherit' });

  // Commit with [skip ci]
  const commitMessage = `chore(release): bump to ${newVersion} to bypass NPM cooldown [skip ci]

This version bump bypasses the NPM 24-hour cooldown restriction.
The next commit will trigger semantic-release to publish this version.`;

  console.log('💾 Committing changes...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  console.log('🚀 Pushing to remote...\n');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n═══════════════════════════════════════\n');
  console.log('✅ Version bump complete!\n');
  console.log('Next steps:\n');
  console.log('1. Make a new commit with a conventional format:');
  console.log('   git commit --allow-empty -m "feat: enable CI/CD automation"');
  console.log('   git push origin main\n');
  console.log('2. Or wait for the next regular commit to trigger release\n');
  console.log('3. Watch the workflow:');
  console.log('   https://github.com/shreesharma07/numsy/actions\n');
  console.log('═══════════════════════════════════════\n');
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\nManual fix:');
  console.log(`  npm version ${bumpType} --no-git-tag-version`);
  console.log('  git add package.json pnpm-lock.yaml');
  console.log(`  git commit -m "chore: bump version [skip ci]"`);
  console.log('  git push origin main\n');
  process.exit(1);
}
