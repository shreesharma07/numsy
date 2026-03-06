//#!/usr/bin/env node
/**
 * Preview what semantic-release would do without requiring GitHub tokens
 * This parses commits and shows what version would be released
 */

const { execSync } = require('child_process');

console.log('🔍 Semantic Release Preview\n');
console.log('📋 Analyzing commits since last release...\n');

try {
    // Get last tag
    let lastTag;
    try {
        lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim();
        console.log(`Last release: ${lastTag}\n`);
    } catch {
        console.log('No previous releases found\n');
        lastTag = '';
    }

    // Get commits since last tag
    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    const commits = execSync(`git log ${range} --pretty=format:"%s"`, { encoding: 'utf-8' })
        .split('\n')
        .filter(Boolean);

    if (commits.length === 0) {
        console.log('✅ No new commits since last release');
        process.exit(0);
    }

    console.log(`Found ${commits.length} commits:\n`);

    // Analyze commits
    const analysis = {
        breaking: [],
        features: [],
        fixes: [],
        other: [],
    };

    commits.forEach(commit => {
        if (commit.includes('BREAKING CHANGE') || commit.match(/^[a-z]+!:/)) {
            analysis.breaking.push(commit);
        } else if (commit.startsWith('feat')) {
            analysis.features.push(commit);
        } else if (commit.startsWith('fix')) {
            analysis.fixes.push(commit);
        } else {
            analysis.other.push(commit);
        }
    });

    // Determine version bump
    let bump = 'none';
    if (analysis.breaking.length > 0) {
        bump = 'major';
    } else if (analysis.features.length > 0) {
        bump = 'minor';
    } else if (analysis.fixes.length > 0) {
        bump = 'patch';
    }

    // Calculate next version
    const currentVersion = require('../package.json').version;
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    let nextVersion = currentVersion;

    if (bump === 'major') {
        nextVersion = `${major + 1}.0.0`;
    } else if (bump === 'minor') {
        nextVersion = `${major}.${minor + 1}.0`;
    } else if (bump === 'patch') {
        nextVersion = `${major}.${minor}.${patch + 1}`;
    }

    console.log('📊 Commit Analysis:');
    console.log('─'.repeat(50));

    if (analysis.breaking.length > 0) {
        console.log(`\n💥 Breaking Changes (${analysis.breaking.length}):`);
        analysis.breaking.forEach(c => console.log(`  - ${c}`));
    }

    if (analysis.features.length > 0) {
        console.log(`\n✨ Features (${analysis.features.length}):`);
        analysis.features.forEach(c => console.log(`  - ${c}`));
    }

    if (analysis.fixes.length > 0) {
        console.log(`\n🐛 Fixes (${analysis.fixes.length}):`);
        analysis.fixes.forEach(c => console.log(`  - ${c}`));
    }

    if (analysis.other.length > 0) {
        console.log(`\n📝 Other (${analysis.other.length}):`);
        analysis.other.forEach(c => console.log(`  - ${c}`));
    }

    console.log('\n' + '─'.repeat(50));
    console.log('\n🎯 Release Prediction:');
    console.log(`   Current version: ${currentVersion}`);
    console.log(`   Version bump:    ${bump.toUpperCase()}`);
    console.log(`   Next version:    ${nextVersion}`);

    if (bump === 'none') {
        console.log('\n❌ No releasable commits found');
        console.log('   Commits with types: style, test, ci, chore do not trigger releases');
    } else {
        console.log(`\n✅ When merged to main, this will create release ${nextVersion}`);
    }

    console.log('\n💡 Tip: Use conventional commits (feat:, fix:, etc.) to trigger releases');
    console.log('   See: https://www.conventionalcommits.org/\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
