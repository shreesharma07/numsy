# GitHub Actions Workflows

This directory contains the CI/CD workflow for the Numsy project.

## 📋 Active Workflow

### **main.yml** - Unified CI/CD Pipeline ⭐

**Single streamlined workflow for all continuous integration, security, testing, and deployment.**

**Triggers:**

- Push to `main` branch
- Pull requests to `main`
- Manual dispatch

**Jobs:**

#### 1. **build-test-security** (Runs on all events)

- ✅ **Code Quality**: Linting, formatting, type checking via `pnpm run validate`
- 🔒 **Security Scans**:
  - pnpm audit
  - Snyk vulnerability scanning (--all-projects for workspace support)
  - CodeQL security analysis
- 🧪 **Tests**: Jest unit tests with coverage reporting
- 📊 **Coverage**: Uploads to Codecov
- 📦 **Build**: Compiles TypeScript, creates artifacts, checks package size

#### 2. **dependency-review** (PR only)

- 📋 Reviews dependency changes for security issues
- Fails on moderate+ severity vulnerabilities

#### 3. **release** (main branch only)

- 🚀 **Semantic Release**: Automated versioning based on commit messages
- 📦 **NPM Publish**: Publishes to NPM registry
- 📝 **CHANGELOG**: Auto-generates changelog
- 🏷️ **Git Tags**: Creates version tags
- ⏰ **NPM Cooldown Handling**: Gracefully handles 24-hour republish restrictions

**Required Secrets:**

- `GITHUB_TOKEN` (auto-provided)
- `NPM_TOKEN` (for NPM publishing)
- `CODECOV_TOKEN` (for coverage reporting)
- `SNYK_TOKEN` (for security scanning)

**Environment:**

- Node.js: 20.x
- Package Manager: pnpm 8.x
- OS: Ubuntu Latest

---

## 🔧 Setup Requirements

### 1. Repository Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

```text
NPM_TOKEN        - NPM publish token (from npmjs.com)
CODECOV_TOKEN    - Codecov upload token
SNYK_TOKEN       - Snyk API token
```

### 2. Branch Protection

Configure branch protection for `main`:

- Require status checks: `build-test-security`
- Require pull request reviews
- Enforce linear history (recommended)

---

## 📖 Documentation

For detailed CI/CD documentation, see:

- [CI/CD Setup Complete](../../docs/CI_CD_SETUP_COMPLETE.md)
- [CI/CD Workflow Guide](../../docs/CI_CD_WORKFLOW_GUIDE.md)
- [NPM Publishing Guide](../../docs/NPM_PUBLISHING_GUIDE.md)
- [Secrets Setup](../../docs/SECRETS_SETUP.md)

---

## 🎯 Workflow Execution

### On Pull Request

1. Runs `build-test-security` job (quality + security + tests + build)
2. Runs `dependency-review` job (checks new dependencies)

### On Push to Main

1. Runs `build-test-security` job (quality + security + tests + build)
2. Runs `release` job (semantic-release + NPM publish)

### Manual Dispatch

1. Trigger manually from Actions tab
2. Runs all applicable jobs based on branch

---

## ⚡ Key Features

- **Single Pipeline**: All checks consolidated into one streamlined workflow
- **Fast Execution**: Sequential steps in single job (no job overhead)
- **Smart Releases**: Conventional commits trigger automatic versioning
- **Security First**: Multiple security layers (audit, Snyk, CodeQL)
- **Coverage Tracking**: Automatic Codecov integration
- **Error Handling**: Graceful handling of NPM cooldown and security findings

---

## 🚫 Removed Workflows

The following workflows have been consolidated into `main.yml`:

- ~~ci.yml~~ (deprecated)
- ~~npm-publish.yml~~ (deprecated)
- ~~publish.yml~~ (deprecated)
- ~~release.yml~~ (deprecated)
- ~~security.yml~~ (deprecated)
- ~~semantic-release.yml~~ (deprecated)

All functionality now exists in the single `main.yml` workflow.

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
