#!/usr/bin/env node

/**
 * Check NPM package status and provide guidance for publishing
 * Usage: node scripts/check-npm-status.js
 */

const { execSync } = require('child_process');
const packageJson = require('../package.json');

const PACKAGE_NAME = packageJson.name;
const CURRENT_VERSION = packageJson.version;

console.log('\n🔍 Checking NPM Package Status\n');
console.log('═══════════════════════════════════════\n');

// Check if package exists on NPM
try {
  console.log(`📦 Package: ${PACKAGE_NAME}`);
  console.log(`📌 Current version (local): ${CURRENT_VERSION}\n`);

  // Get NPM package info
  const npmInfo = execSync(`npm view ${PACKAGE_NAME} --json`, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const packageInfo = JSON.parse(npmInfo);
  const latestVersion = packageInfo.version || packageInfo['dist-tags']?.latest;
  const allVersions = packageInfo.versions || [latestVersion];

  console.log(`✅ Package exists on NPM`);
  console.log(`📍 Latest published version: ${latestVersion}`);
  console.log(`📚 Total versions published: ${allVersions.length}\n`);

  // Check if current version exists
  const versionExists = allVersions.includes(CURRENT_VERSION);

  if (versionExists) {
    console.log(`⚠️  WARNING: Version ${CURRENT_VERSION} already exists on NPM!\n`);
    console.log('═══════════════════════════════════════\n');
    console.log('🚨 CANNOT PUBLISH - VERSION ALREADY EXISTS\n');
    console.log('Options:\n');
    console.log('1. Bump to a new version:');
    console.log(`   npm version patch    # → ${bumpVersion(CURRENT_VERSION, 'patch')}`);
    console.log(`   npm version minor    # → ${bumpVersion(CURRENT_VERSION, 'minor')}`);
    console.log(`   npm version major    # → ${bumpVersion(CURRENT_VERSION, 'major')}\n`);
    console.log('2. Let semantic-release handle it automatically\n');
    console.log('3. If recently unpublished, wait 24 hours\n');
    process.exit(1);
  } else {
    console.log(`✅ Version ${CURRENT_VERSION} is available for publishing\n`);
    console.log('═══════════════════════════════════════\n');
    console.log('📦 Ready to publish!\n');
    console.log('Publish commands:');
    console.log('  pnpm publish --access public');
    console.log('  # or let semantic-release handle it automatically\n');
  }

  // Show recent versions
  if (allVersions.length > 0) {
    console.log('📋 Recent versions:');
    const recentVersions = allVersions.slice(-5).reverse();
    recentVersions.forEach((ver, idx) => {
      const marker = ver === latestVersion ? '← latest' : '';
      console.log(`   ${idx + 1}. ${ver} ${marker}`);
    });
    console.log();
  }
} catch (error) {
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    console.log(`❌ Package "${PACKAGE_NAME}" not found on NPM\n`);
    console.log('═══════════════════════════════════════\n');
    console.log('📦 FIRST TIME PUBLISH\n');
    console.log('This will be the first version published to NPM.\n');
    console.log('Commands:');
    console.log('  npm login');
    console.log('  pnpm publish --access public\n');
    console.log('Or let semantic-release handle it automatically.\n');
  } else {
    console.error('❌ Error checking NPM status:', error.message);
    console.log('\nTry running manually:');
    console.log(`  npm view ${PACKAGE_NAME}\n`);
    process.exit(1);
  }
}

console.log('═══════════════════════════════════════\n');

/**
 * Bump version helper
 */
function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return version;
  }
}
