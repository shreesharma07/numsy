# 🚀 CI/CD Workflow Guide

## Overview

This project uses a comprehensive CI/CD pipeline that automatically handles code quality, security, testing, building, and releasing.

## 📋 Table of Contents

1. [Workflow Structure](#workflow-structure)
2. [Git Hooks (Local Validation)](#git-hooks-local-validation)
3. [CI/CD Pipeline (Remote Validation)](#cicd-pipeline-remote-validation)
4. [Release Process](#release-process)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Workflow Structure

```
┌─────────────────┐
│  Local Machine  │
└────────┬────────┘
         │
         ├─ pre-commit  → Lint staged files
         ├─ commit-msg  → Validate commit format
         └─ pre-push    → Run all checks (lint, type, test, build)
         │
         ↓
┌────────────────────────────────────────────────────────────┐
│                    GitHub Actions (CI/CD)                   │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Quality  │  │ Security │  │   Test   │  │  Build   │  │
│  │  Check   │  │   Scan   │  │  Suite   │  │ Package  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │          │
│       └─────────────┴─────────────┴─────────────┘          │
│                       │                                     │
│                       ↓                                     │
│              ┌────────────────┐                            │
│              │  All Passed?   │                            │
│              └───────┬────────┘                            │
│                      │                                     │
│           ┌──────────┴──────────┐                         │
│           │                     │                         │
│           ↓                     ↓                         │
│    ┌────────────┐        ┌──────────┐                    │
│    │  Merge PR  │        │ Release  │ (main/develop)     │
│    └────────────┘        │  (Auto)  │                    │
│                          └────┬─────┘                    │
│                               │                           │
│                               ↓                           │
│                    ┌──────────────────┐                  │
│                    │ Semantic Release │                  │
│                    │ - Bump version   │                  │
│                    │ - Update changelog│                  │
│                    │ - Create tag     │                  │
│                    │ - Publish NPM    │                  │
│                    │ - GitHub release │                  │
│                    └──────────────────┘                  │
└────────────────────────────────────────────────────────────┘
```

---

## Git Hooks (Local Validation)

Git hooks run on your local machine before code reaches GitHub.

### 1. pre-commit

**Trigger:** Before each commit  
**What it does:** Runs lint-staged on modified files

```bash
# Automatically runs when you commit
git commit -m "feat: add new feature"

# What happens:
# ✓ Formats code with Prettier
# ✓ Lints code with ESLint
# ✓ Fixes auto-fixable issues
```

### 2. commit-msg

**Trigger:** After commit message is written  
**What it does:** Validates commit message format

```bash
# Valid commit formats:
feat: add new feature          → ✅ Triggers minor release
fix: resolve bug               → ✅ Triggers patch release
feat!: breaking change         → ✅ Triggers major release
docs: update documentation     → ✅ No release
chore: update dependencies     → ✅ No release

# Invalid formats:
Added new feature             → ❌ Rejected
quick fix                     → ❌ Rejected
wip                          → ❌ Rejected
```

**Commit Convention:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature (minor version)
- `fix`: Bug fix (patch version)
- `perf`: Performance improvement (patch version)
- `docs`: Documentation (no release)
- `style`: Code style (no release)
- `refactor`: Code refactoring (patch version)
- `test`: Tests (no release)
- `build`: Build system (patch version)
- `ci`: CI/CD changes (no release)
- `chore`: Maintenance (no release)

**Breaking Changes:**

```bash
# Method 1: ! after type
git commit -m "feat!: redesign API"

# Method 2: BREAKING CHANGE in footer
git commit -m "feat: new API

BREAKING CHANGE: Old API endpoints removed"
```

### 3. pre-push

**Trigger:** Before pushing to remote  
**What it does:** Comprehensive validation

```bash
# Automatically runs when you push
git push origin feature/my-feature

# What happens:
# 1. ✓ Validates all commit messages
# 2. ✓ Runs lint check
# 3. ✓ Runs type check
# 4. ✓ Runs all tests
# 5. ✓ Runs build check

# If any check fails:
# ✗ Push is blocked
# → Fix issues locally
# → Try push again
```

**Bypass pre-push (not recommended):**

```bash
# In emergencies only!
git push --no-verify
```

---

## CI/CD Pipeline (Remote Validation)

The main pipeline runs on GitHub Actions for all pushes and PRs.

### Pipeline Jobs

#### 1. Quality Check

- **Runs:** ESLint, Prettier, TypeScript
- **Duration:** ~1-2 minutes
- **Blocks merge:** Yes

```yaml
Steps:
1. Checkout code
2. Install dependencies
3. Run lint check
4. Run format check
5. Run type check
```

#### 2. Security Scan

- **Runs:** pnpm audit, Snyk, CodeQL
- **Duration:** ~2-3 minutes
- **Blocks merge:** Only for high severity

```yaml
Steps:
1. pnpm audit (moderate+)
2. Snyk vulnerability scan
3. CodeQL code analysis
```

#### 3. Test Suite

- **Runs:** Unit tests, E2E tests
- **Matrix:** Node 18/20 × Ubuntu/Windows
- **Duration:** ~3-5 minutes
- **Blocks merge:** Yes

```yaml
Matrix:
  - Node 18 on Ubuntu
  - Node 20 on Ubuntu
  - Node 18 on Windows
  - Node 20 on Windows
```

#### 4. Build Package

- **Runs:** After quality & tests pass
- **Duration:** ~1-2 minutes
- **Blocks merge:** Yes

```yaml
Steps:
1. Clean dist directory
2. Build with SWC
3. Generate TypeScript declarations
4. Create tarball
5. Upload artifacts
```

#### 5. Release (Semantic Release)

- **Runs:** Only on main/develop branches
- **Trigger:** After all checks pass
- **Duration:** ~2-3 minutes
- **Automatic:** Yes

```yaml
Conditions:
  - Branch: main, develop, or release/*
  - Event: push (not PR)
  - Checks: All passed
  - Commits: Not containing [skip ci]
```

---

## Release Process

### Automatic Release Flow

```bash
# 1. Make changes locally
git checkout -b feature/my-feature
# ... make changes ...

# 2. Commit with conventional format
git add .
git commit -m "feat: add awesome feature"  # This will trigger a release!

# 3. Push to feature branch
git push origin feature/my-feature

# 4. Create Pull Request
# CI runs all checks (quality, security, test, build)

# 5. Merge PR to main
# After merge to main:
# → CI runs again
# → Release job triggers
# → Semantic-release analyzes commits
# → Determines version bump (feat = minor)
# → Updates version in package.json
# → Updates CHANGELOG.md
# → Creates git tag (e.g., v1.1.0)
# → Publishes to NPM
# → Creates GitHub release
# → Commits changes back to main with [skip ci]
```

### What Gets Released?

**Version Bumps:**

```
Current: 1.2.3

feat:     → 1.3.0 (minor)
fix:      → 1.2.4 (patch)
feat!:    → 2.0.0 (major)
docs:     → No release
chore:    → No release
```

**Release Contents:**

1. **NPM Package**
   - Published to <https://www.npmjs.com/package/numsy>
   - Tagged as `@latest`
   - Includes dist/ folder

2. **GitHub Release**
   - Created at <https://github.com/shreesharma07/numsy/releases>
   - Includes changelog
   - Includes tarball
   - Tagged with version (e.g., v1.3.0)

3. **Git Commit**
   - Updates package.json version
   - Updates CHANGELOG.md
   - Message: `chore(release): 1.3.0 [skip ci]`

### Manual Release (Emergency)

```bash
# Local dry-run to preview release
pnpm run release:dry

# Manual release (not recommended)
# Visit: https://github.com/shreesharma07/numsy/actions/workflows/semantic-release.yml
# Click "Run workflow"
# Type "CONFIRM" in the input
```

---

## Best Practices

### 1. Commit Message Guidelines

✅ **Good:**

```bash
feat: add WhatsApp number validation
fix: resolve parser error with special characters
docs: update API documentation
refactor: improve validation logic
test: add tests for edge cases
```

❌ **Bad:**

```bash
update
fixed bug
WIP
changes
quick fix
```

### 2. Branch Strategy

```bash
main            # Production ready code, auto-releases
  ↑
  ├─ develop    # Integration branch, beta releases
  │   ↑
  │   ├─ feature/...   # New features
  │   ├─ bugfix/...    # Bug fixes
  │   └─ refactor/...  # Code improvements
  ↑
  └─ hotfix/... # Emergency fixes for production
```

### 3. Pull Request Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push origin feature/my-feature

# 4. Wait for CI checks ✓

# 5. Request review

# 6. Merge to develop or main
# → Automatic release if merged to main!
```

### 4. Avoiding Accidental Releases

**Skip CI for non-code changes:**

```bash
git commit -m "docs: update README [skip ci]"
git commit -m "chore: update config [skip ci]"
```

**Use appropriate commit types:**

```bash
# Will NOT trigger release:
docs: ...
chore: ...
ci: ...
test: ...
style: ...

# Will trigger release:
feat: ...    (minor)
fix: ...     (patch)
perf: ...    (patch)
refactor: ... (patch)
```

---

## Troubleshooting

### Issue: Pre-push hook fails

**Solution:**

```bash
# Run checks manually to see specific error
pnpm run lint:check
pnpm run type-check
pnpm test
pnpm run build

# Fix issues and try again
```

### Issue: CI checks failing on PR

**Check the logs:**

```bash
# Visit: https://github.com/shreesharma07/numsy/actions
# Click on failed workflow
# Review error messages
```

**Common fixes:**

```bash
# Lint errors
pnpm run lint

# Type errors
pnpm run type-check

# Test failures
pnpm test

# Build errors
pnpm run build
```

### Issue: No release created after merge

**Possible reasons:**

1. **No feat/fix commits:**

   ```bash
   # Only docs/chore commits don't trigger releases
   # Add a feat or fix commit
   ```

2. **Used [skip ci]:**

   ```bash
   # Remove [skip ci] from commit messages
   ```

3. **NPM_TOKEN not set:**

   ```bash
   # Check: https://github.com/shreesharma07/numsy/settings/secrets/actions
   # Ensure NPM_TOKEN exists
   ```

4. **Commit format invalid:**

   ```bash
   # Ensure conventional commit format
   # feat: description (correct)
   # feat description (wrong)
   ```

### Issue: Release failed mid-process

**Check the release workflow logs:**

```bash
# Visit: https://github.com/shreesharma07/numsy/actions
# Find the failed "CI/CD Pipeline" workflow
# Review "Semantic Release" job logs
```

**Common issues:**

- NPM authentication failed → Check NPM_TOKEN
- Git push failed → Check branch protection settings
- Build failed → Check build logs

---

## Workflow Files Reference

### Main Workflow

- **File:** `.github/workflows/main.yml`
- **Triggers:** Push to any branch, PRs to main/develop
- **Jobs:** quality, security, codeql, test, build, release

### Legacy Workflows (Disabled)

- ~~`.github/workflows/ci.yml`~~ → Use main.yml
- ~~`.github/workflows/release.yml`~~ → Integrated in main.yml
- ~~`.github/workflows/semantic-release.yml`~~ → Manual only
- `.github/workflows/security.yml` → Scheduled daily scans
- `.github/workflows/publish.yml` → Manual publishing only

---

## Quick Reference Commands

```bash
# Local development
pnpm dev                 # Start dev server
pnpm test               # Run tests
pnpm test:watch         # Watch mode tests
pnpm run lint           # Lint and fix
pnpm run format         # Format code
pnpm run build          # Build package

# Release preview (local)
pnpm run release:dry    # See what would be released
pnpm run release:preview # Preview without CI check

# Validation
pnpm run validate       # Run all checks (lint + type + test)
pnpm run ci            # Full CI checks (validate + build)

# Git workflow
git commit -m "feat: ..."     # Triggers pre-commit & commit-msg
git push                      # Triggers pre-push
# Merge to main               # Triggers full CI + release
```

---

## Support & Resources

- **GitHub Actions:** <https://github.com/shreesharma07/numsy/actions>
- **NPM Package:** <https://www.npmjs.com/package/numsy>
- **Releases:** <https://github.com/shreesharma07/numsy/releases>
- **Semantic Release Docs:** <https://semantic-release.gitbook.io/>
- **Conventional Commits:** <https://www.conventionalcommits.org/>

**Last Updated:** 2026-03-07
