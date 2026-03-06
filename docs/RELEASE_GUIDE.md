# 🚀 Release Management Guide

## Automated Release with Semantic Release

Numsy uses **semantic-release** for fully automated version management and package publishing. This guide explains how it works and how to use it.

---

## 📋 Table of Contents

1. [How It Works](#how-it-works)
2. [Conventional Commits](#conventional-commits)
3. [Release Workflow](#release-workflow)
4. [Version Bumping Rules](#version-bumping-rules)
5. [Manual Release](#manual-release)
6. [Troubleshooting](#troubleshooting)

---

## How It Works

### Automated Process

When you merge commits to protected branches (`main`, `develop`), semantic-release automatically:

1. **Analyzes commits** using conventional commit format
2. **Determines version bump** (major, minor, patch)
3. **Generates CHANGELOG.md** with all changes
4. **Updates package.json** version
5. **Creates Git tag** (e.g., v1.2.3)
6. **Publishes to NPM** with proper dist-tags
7. **Creates GitHub release** with release notes
8. **Comments on issues/PRs** that were resolved

### Branches and Pre-releases

| Branch      | Release Type      | NPM Tag  | Example Version |
| ----------- | ----------------- | -------- | --------------- |
| `main`      | Production        | `latest` | `1.2.3`         |
| `develop`   | Beta              | `beta`   | `1.3.0-beta.1`  |
| `release/*` | Release Candidate | `rc`     | `1.3.0-rc.1`    |

---

## Conventional Commits

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types and Version Impact

| Type       | Description      | Version Bump      | Example                          |
| ---------- | ---------------- | ----------------- | -------------------------------- |
| `feat`     | New feature      | **MINOR** (1.x.0) | `feat: add batch processing API` |
| `fix`      | Bug fix          | **PATCH** (1.0.x) | `fix: resolve memory leak`       |
| `perf`     | Performance      | **PATCH**         | `perf: optimize CSV parsing`     |
| `docs`     | Documentation    | **PATCH**         | `docs: update API examples`      |
| `refactor` | Code refactoring | **PATCH**         | `refactor: simplify validation`  |
| `build`    | Build changes    | **PATCH**         | `build: update dependencies`     |
| `style`    | Code style       | **NO RELEASE**    | `style: format with prettier`    |
| `test`     | Tests            | **NO RELEASE**    | `test: add unit tests`           |
| `ci`       | CI changes       | **NO RELEASE**    | `ci: update workflow`            |
| `chore`    | Maintenance      | **NO RELEASE**    | `chore: update .gitignore`       |

### Breaking Changes

Add `BREAKING CHANGE:` in the footer or `!` after type for **MAJOR** version bump:

```bash
# Method 1: Using footer
feat: change API response format

BREAKING CHANGE: API now returns data in new format

# Method 2: Using exclamation mark
feat!: change API response format
```

**Result**: `1.0.0` → `2.0.0` (MAJOR bump)

### Examples

#### Minor Release (New Feature)

```bash
git commit -m "feat: add support for WhatsApp numbers

- Add WhatsApp number validation
- Update parser to detect WhatsApp columns
- Add test cases for WhatsApp format"
```

**Result**: `1.2.3` → `1.3.0`

#### Patch Release (Bug Fix)

```bash
git commit -m "fix: correct phone number regex pattern

The previous regex was not matching numbers starting with 8.
Updated pattern to include all valid prefixes (6-9)."
```

**Result**: `1.2.3` → `1.2.4`

#### No Release (Chore)

```bash
git commit -m "chore: update dev dependencies"
```

**Result**: No version change

---

## Release Workflow

### Production Release (main branch)

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Implement feature
# ... make changes ...

# 3. Commit with conventional format
git add .
git commit -m "feat: add new feature"

# 4. Push and create PR to develop
git push origin feature/new-feature
gh pr create --base develop

# 5. After PR is merged to develop and tested
# Create PR from develop to main

# 6. When merged to main, semantic-release automatically:
# - Analyzes commits since last release
# - Bumps version (e.g., 1.2.3 → 1.3.0)
# - Updates CHANGELOG.md
# - Creates git tag v1.3.0
# - Publishes to npm with @latest tag
# - Creates GitHub release
```

### Beta Release (develop branch)

```bash
# 1. Merge features to develop
git checkout develop
git merge feature/new-feature

# 2. Push to develop
git push origin develop

# 3. Semantic-release automatically:
# - Creates beta version (e.g., 1.3.0-beta.1)
# - Publishes to npm with @beta tag
# - No GitHub release created
```

### Release Candidate (release/\* branch)

```bash
# 1. Create release branch from develop
git checkout -b release/1.3.0 develop

# 2. Make final adjustments
git commit -m "chore: prepare release 1.3.0"

# 3. Push release branch
git push origin release/1.3.0

# 4. Semantic-release creates RC:
# - Version: 1.3.0-rc.1
# - NPM tag: @rc
```

---

## Version Bumping Rules

### Automatic Version Determination

Semantic-release analyzes ALL commits since the last release:

```bash
# Example commit history:
feat: add feature A        # → minor bump
fix: resolve bug B         # → patch bump
feat: add feature C        # → minor bump

# Result: MINOR bump (highest precedence)
# 1.2.3 → 1.3.0
```

### Version Precedence

1. **MAJOR** (Breaking changes) - Highest priority
2. **MINOR** (New features)
3. **PATCH** (Bug fixes, performance, docs)

### Examples

#### Scenario 1: Only fixes

```bash
fix: resolve CSV parsing error
fix: correct validation logic
```

**Result**: `1.2.3` → `1.2.4` (PATCH)

#### Scenario 2: Features and fixes

```bash
feat: add batch processing
fix: resolve memory leak
```

**Result**: `1.2.3` → `1.3.0` (MINOR - feature takes precedence)

#### Scenario 3: Breaking change

```bash
feat!: change API response format
feat: add new endpoint
fix: resolve bug
```

**Result**: `1.2.3` → `2.0.0` (MAJOR - breaking change takes precedence)

---

## Manual Release

### Dry Run (Test Without Publishing)

```bash
# See what would be released
pnpm run release:dry

# Output shows:
# - Next version number
# - Generated changelog
# - Files that would be updated
```

### Local Release (Development)

```bash
# Run semantic-release locally
pnpm run release:local

# This will:
# - Analyze commits
# - Update version
# - Generate changelog
# - Create tag (but not push)
# - Not publish to npm
```

### Emergency Hotfix

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the bug
git commit -m "fix: resolve critical security issue

This fixes CVE-2026-xxxxx"

# 3. Merge to main with PR
gh pr create --base main --title "Hotfix: Critical security fix"

# 4. After merge, semantic-release automatically releases patch
# 1.2.3 → 1.2.4
```

---

## Configuration

### Release Configuration (.releaserc.json)

```json
{
  "branches": ["main", "develop", "release/*"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### Plugin Responsibilities

1. **commit-analyzer**: Determines version bump
2. **release-notes-generator**: Creates CHANGELOG entries
3. **changelog**: Updates CHANGELOG.md file
4. **npm**: Publishes to npm registry
5. **git**: Commits updated files and creates tag
6. **github**: Creates GitHub release with assets

---

## Troubleshooting

### Issue: Release Not Triggered

**Possible causes:**

1. **No releasable commits**

   ```bash
   # Check commits since last release
   git log v1.2.3..HEAD --oneline

   # If only chore/style/ci commits, no release is triggered
   ```

2. **Commit message contains `[skip ci]`**

   ```bash
   # This will skip the release
   git commit -m "chore: update deps [skip ci]"
   ```

3. **Not on release branch**

   ```bash
   # Semantic-release only runs on: main, develop, release/*
   git branch --show-current
   ```

### Issue: NPM Publish Failed

**Check:**

1. **NPM_TOKEN secret is set**

   ```bash
   # In GitHub: Settings → Secrets → Actions
   # Add NPM_TOKEN with your npm access token
   ```

2. **Package name is available**

   ```bash
   npm view numsy
   # If exists, ensure you have publish rights
   ```

3. **Version already exists**

   ```bash
   npm view numsy versions
   # Cannot republish same version
   ```

### Issue: Git Push Failed

**Check:**

1. **GITHUB_TOKEN has correct permissions**

   ```yaml
   # In workflow file:
   permissions:
     contents: write
     issues: write
     pull-requests: write
   ```

2. **Branch protection allows bot**

   ```bash
   # In GitHub: Settings → Branches
   # Ensure semantic-release-bot can push
   ```

### Issue: Wrong Version Bump

**Verify commit messages:**

```bash
# Check recent commits
git log --oneline -10

# Ensure they follow conventional format:
# ✅ feat: add feature
# ✅ fix: resolve bug
# ❌ Add feature  (will not trigger release)
# ❌ Bug fix      (will not trigger release)
```

---

## Best Practices

### 1. Write Clear Commit Messages

```bash
# ✅ Good
feat(parser): add Excel 2007+ format support

# ❌ Bad
update parser
```

### 2. Group Related Changes

```bash
# Squash related commits before merging
git rebase -i HEAD~5
```

### 3. Use Scopes

```bash
feat(validation): add WhatsApp number support
fix(parser): resolve CSV encoding issue
docs(api): update endpoint examples
```

### 4. Preview Changes Before Merge

```bash
# Run dry-run on feature branch
pnpm run release:dry
```

### 5. Update CHANGELOG Manually for Major Releases

```bash
# After automatic CHANGELOG generation
# Add migration guide for breaking changes
```

---

## GitHub Actions Integration

### Workflow File

`.github/workflows/semantic-release.yml` handles the release process:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - release/*

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run tests
      - Build package
      - Run semantic-release
```

### Required Secrets

| Secret         | Description | How to Get                 |
| -------------- | ----------- | -------------------------- |
| `GITHUB_TOKEN` | Automatic   | Provided by GitHub Actions |
| `NPM_TOKEN`    | NPM publish | `npm token create`         |

---

## Monitoring Releases

### Check Release Status

```bash
# View GitHub Actions runs
gh run list --workflow=semantic-release.yml

# View latest release
gh release view --web
```

### NPM Package Status

```bash
# Check published versions
npm view numsy versions

# Check latest version
npm view numsy version

# Check beta version
npm view numsy dist-tags
```

### Release History

```bash
# View all git tags
git tag -l "v*"

# View specific release
git show v1.2.3
```

---

## Additional Resources

- [Semantic Release Docs](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [NPM Publishing Guide](./NPM_PUBLISHING_GUIDE.md)
- [Git Flow Guide](./GIT_FLOW.md)

---

**Last Updated**: March 6, 2026  
**Version**: 1.0.0
