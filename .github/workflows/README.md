# GitHub Actions Workflows

This directory contains all CI/CD workflows for the Numsy project.

## 📋 Active Workflows

### 1. **main.yml** - Primary CI/CD Pipeline ⭐

**Main workflow for all continuous integration and deployment.**

**Triggers:**

- Push to `main`, `develop`, feature branches
- Pull requests to `main`, `develop`
- Manual dispatch

**Jobs:**

- ✅ **Quality**: Linting, formatting, type checking, validation
- 🔒 **Security**: pnpm audit, Snyk scanning
- 🔍 **CodeQL**: Security analysis
- 🧪 **Test**: Unit tests, E2E tests, coverage (Node 18 & 20, Ubuntu & Windows)
- 📦 **Build**: Build package and create artifacts
- 📊 **Dependency Review**: Review dependencies on PRs
- 🚀 **Release**: Semantic release, NPM publish (main/develop only)
- ✔️ **Status**: Overall CI status check

**Required Secrets:**

- `GITHUB_TOKEN` (auto-provided)
- `NPM_TOKEN` (for publishing)
- `CODECOV_TOKEN` (for coverage)
- `SNYK_TOKEN` (for security scans)

---

### 2. **publish.yml** - Manual NPM Publishing

**Direct NPM publishing workflow.**

**Triggers:**

- GitHub releases (created)
- Manual dispatch

**Use Case:** Quick manual publishing when semantic-release is not needed.

**Required Secrets:**

- `NPM_TOKEN`

---

### 3. **security.yml** - Scheduled Security Monitoring

**Regular security scanning and monitoring.**

**Triggers:**

- Push to `main`, `develop`, `release/*`
- Daily at 00:00 UTC (scheduled)
- Manual dispatch

**Jobs:**

- Snyk security scans
- CodeQL analysis (extended security queries)
- pnpm audit
- Auto-create issues for vulnerabilities

**Required Secrets:**

- `SNYK_TOKEN`

---

## 📁 Legacy/Reference Workflows

### ⚠️ ci.yml (Deprecated)

Replaced by `main.yml`. Kept for reference only.

### ⚠️ npm-publish.yml (Deprecated)

Basic npm publish workflow. Replaced by semantic-release in `main.yml`.

### ⚠️ release.yml (Deprecated)

Manual release workflow. Use `main.yml` semantic-release instead.

### ⚠️ semantic-release.yml (Deprecated)

Standalone semantic-release. Integrated into `main.yml`.

---

## 🔧 Setup Requirements

### 1. Repository Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

```text
NPM_TOKEN          - NPM automation token (from npmjs.com)
CODECOV_TOKEN      - Codecov token (from codecov.io)
SNYK_TOKEN         - Snyk API token (from snyk.io)
```

### 2. NPM Token Setup

1. Go to [npmjs.com](https://www.npmjs.com)
2. Navigate to **Account Settings → Access Tokens**
3. Click **Generate New Token** → **Automation**
4. Copy token and add as `NPM_TOKEN` secret

### 3. Codecov Setup

1. Visit [codecov.io](https://codecov.io)
2. Connect your GitHub repository
3. Copy the repository token
4. Add as `CODECOV_TOKEN` secret

### 4. Snyk Setup

1. Sign up at [snyk.io](https://snyk.io)
2. Go to **Settings → General → Auth Token**
3. Copy token and add as `SNYK_TOKEN` secret

---

## 🔄 Workflow Behavior

### Automatic Release Flow

**On push to `main` branch:**

```text
1. Quality checks (lint, format, type-check)
2. Security scans (audit, Snyk)
3. CodeQL analysis
4. Run tests (all OS/Node versions)
5. Build package
6. Semantic release analyzes commits
7. If feat/fix commits: bump version, update CHANGELOG, publish to NPM
8. Create GitHub release with notes
```

### Commit Message Format for Releases

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Patch release (1.0.0 → 1.0.1)
fix: fix bug in validation

# Minor release (1.0.0 → 1.1.0)
feat: add new feature

# Major release (1.0.0 → 2.0.0)
feat!: breaking change
BREAKING CHANGE: description

# No release
docs: update README
chore: update dependencies
style: format code
refactor: refactor code
test: add tests
```

### Skip CI

Add `[skip ci]` to commit message to skip workflows:

```bash
git commit -m "docs: update README [skip ci]"
```

---

## 🧪 Running Workflows Locally

### Using Act (GitHub Actions locally)

```bash
# Install act
brew install act  # macOS
# or follow: https://github.com/nektos/act

# Run a specific job
act -j quality

# Run entire workflow
act push
```

### Manual Testing

```bash
# Run all checks locally
pnpm run validate     # lint + type-check + tests
pnpm run build        # build package
pnpm test:cov         # tests with coverage
pnpm run audit:check  # security audit
```

---

## 📊 Coverage Reports

Coverage reports are:

- Generated on every test run (Ubuntu + Node 20)
- Uploaded to Codecov automatically
- Available in `coverage/` directory locally
- Viewable at: `https://codecov.io/gh/shreesharma07/numsy`

---

## 🚀 Release Process

### Automatic (Recommended)

1. Make changes and commit with conventional commits
2. Push to `main` branch
3. CI/CD workflow runs automatically
4. If releasable commits exist, semantic-release:
   - Determines new version
   - Updates CHANGELOG.md
   - Creates git tag
   - Publishes to NPM
   - Creates GitHub release

### Manual (Not Recommended)

Use only in emergencies:

```bash
# Option 1: Trigger main.yml workflow dispatch
# Go to Actions → CI/CD Pipeline → Run workflow

# Option 2: Use legacy publish workflow
# Go to Actions → Publish to NPM → Run workflow
```

---

## 🐛 Troubleshooting

### NPM 24-Hour Cooldown Error

If you see "cannot be republished until 24 hours have passed":

**Solution 1 (Recommended):**
Wait 24 hours and re-run the workflow

**Solution 2 (Quick fix):**

```bash
# Manually bump version
pnpm version patch --no-git-tag-version
git add package.json
git commit -m "chore: bump version [skip ci]"
git push
```

See: [docs/NPM_PUBLISH_ERROR_FIX.md](../../docs/NPM_PUBLISH_ERROR_FIX.md)

### Failed Security Scans

Security scans are set to `continue-on-error: true`, so they won't block:

- Review the scan results in the workflow logs
- Fix critical/high vulnerabilities
- Update dependencies: `pnpm update`

### Test Failures

```bash
# Run tests locally first
pnpm test
pnpm test:e2e
pnpm test:cov

# Check coverage
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

### Build Failures

```bash
# Clean build
pnpm run prebuild  # or: rimraf dist
pnpm run build

# Check TypeScript errors
pnpm run type-check
```

---

## 📈 Workflow Matrix

| Workflow             | Triggers       | Purpose             | Publishes       |
| -------------------- | -------------- | ------------------- | --------------- |
| **main.yml**         | Push/PR/Manual | Full CI/CD pipeline | Yes (main only) |
| **publish.yml**      | Release/Manual | Quick NPM publish   | Yes             |
| **security.yml**     | Push/Scheduled | Security monitoring | No              |
| ci.yml               | Manual only    | Legacy reference    | No              |
| npm-publish.yml      | Manual only    | Legacy reference    | No              |
| release.yml          | Manual only    | Legacy reference    | No              |
| semantic-release.yml | Manual only    | Legacy reference    | No              |

---

## 🔗 Useful Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [NPM Publishing](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [pnpm Documentation](https://pnpm.io/)
- [Codecov](https://docs.codecov.com/)
- [Snyk](https://docs.snyk.io/)

---

## 📝 Best Practices

1. **Always use conventional commits** for proper versioning
2. **Run `pnpm run validate` before pushing** to catch issues early
3. **Keep secrets secure** - never commit them
4. **Review security scans** regularly
5. **Monitor coverage trends** in Codecov
6. **Use feature branches** for development
7. **Let semantic-release handle versions** - don't bump manually
8. **Add `[skip ci]` to docs commits** to save CI minutes

---

## 📞 Support

For issues with workflows:

1. Check workflow logs in GitHub Actions tab
2. Review this README
3. Check [docs/](../../docs/) for detailed guides
4. Open an issue on GitHub

---

**Last Updated:** March 2026
**Maintained by:** Numsy Team
