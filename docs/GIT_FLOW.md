# Git Flow & Branch Protection Strategy

## 🌳 Branch Strategy

### Branch Types

#### 1. **main** (Protected)

- **Purpose**: Production-ready code
- **Protection Rules**:
  - ❌ No direct commits
  - ✅ Requires pull request
  - ✅ Requires 1 approval minimum
  - ✅ Must pass all CI checks
  - ✅ Must be up-to-date with base branch
  - ✅ Requires linear history

#### 2. **develop** (Protected)

- **Purpose**: Integration branch for features
- **Protection Rules**:
  - ❌ No direct commits (except hotfixes)
  - ✅ Requires pull request
  - ✅ Must pass all CI checks
  - ✅ Requires status checks to pass

#### 3. **feature/\*** (Temporary)

- **Purpose**: New features development
- **Naming**: `feature/description-of-feature`
- **Created from**: `develop`
- **Merged into**: `develop`
- **Lifecycle**: Deleted after merge

#### 4. **bugfix/\*** (Temporary)

- **Purpose**: Bug fixes during development
- **Naming**: `bugfix/description-of-bug`
- **Created from**: `develop`
- **Merged into**: `develop`
- **Lifecycle**: Deleted after merge

#### 5. **hotfix/\*** (Temporary)

- **Purpose**: Critical production fixes
- **Naming**: `hotfix/description-of-fix`
- **Created from**: `main`
- **Merged into**: `main` AND `develop`
- **Lifecycle**: Deleted after merge

#### 6. **release/\*** (Temporary)

- **Purpose**: Release preparation
- **Naming**: `release/v1.2.3`
- **Created from**: `develop`
- **Merged into**: `main` AND `develop`
- **Lifecycle**: Deleted after merge

---

## 🔄 Workflow Examples

### Feature Development

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/add-bulk-validation

# 2. Make changes, commit following conventional commits
git add .
git commit -m "feat: add bulk phone number validation"

# 3. Push to remote
git push origin feature/add-bulk-validation

# 4. Create Pull Request to develop
# - Fill PR template
# - Add reviewers
# - Link issues
# - Wait for CI checks

# 5. After approval and merge, delete branch
git branch -d feature/add-bulk-validation
```

### Bug Fix

```bash
# 1. Create bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-csv-parsing-error

# 2. Fix bug and commit
git add .
git commit -m "fix: resolve CSV parsing error for empty rows"

# 3. Push and create PR to develop
git push origin bugfix/fix-csv-parsing-error
```

### Hotfix (Production)

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-validation-bug

# 2. Fix and commit
git add .
git commit -m "fix: resolve critical phone validation bug"

# 3. Push to remote
git push origin hotfix/fix-critical-validation-bug

# 4. Create PR to main
# - Mark as urgent
# - Get quick review
# - Merge to main

# 5. Also merge to develop
git checkout develop
git merge hotfix/fix-critical-validation-bug
git push origin develop

# 6. Tag release
git checkout main
git tag -a v1.0.1 -m "Hotfix: Critical validation bug"
git push origin v1.0.1
```

### Release Process

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version numbers
npm version 1.2.0
# Update CHANGELOG.md

# 3. Commit version bump
git add .
git commit -m "chore: bump version to 1.2.0"

# 4. Push and create PR to main
git push origin release/v1.2.0

# 5. After tests pass, merge to main
# 6. Tag the release
git checkout main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 7. Merge back to develop
git checkout develop
git merge release/v1.2.0
git push origin develop

# 8. Delete release branch
git branch -d release/v1.2.0
```

---

## 📋 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Description              | Example                               |
| ---------- | ------------------------ | ------------------------------------- |
| `feat`     | New feature              | `feat: add batch processing API`      |
| `fix`      | Bug fix                  | `fix: resolve memory leak in parser`  |
| `docs`     | Documentation only       | `docs: update API documentation`      |
| `style`    | Code style changes       | `style: format code with prettier`    |
| `refactor` | Code refactoring         | `refactor: simplify validation logic` |
| `perf`     | Performance improvements | `perf: optimize CSV parsing`          |
| `test`     | Adding tests             | `test: add unit tests for validator`  |
| `build`    | Build system changes     | `build: update dependencies`          |
| `ci`       | CI configuration         | `ci: add security scan workflow`      |
| `chore`    | Maintenance tasks        | `chore: update .gitignore`            |
| `revert`   | Revert previous commit   | `revert: revert feat: add feature X`  |

### Examples

```bash
# Feature with scope
git commit -m "feat(parser): add support for Excel files"

# Bug fix with issue reference
git commit -m "fix: resolve CSV parsing error

Fixes #123"

# Breaking change
git commit -m "feat!: change API response format

BREAKING CHANGE: API now returns data in new format"
```

---

## 🔒 Branch Protection Rules (GitHub Settings)

### For `main` branch:

```yaml
Branch Protection Rules:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    ✅ Dismiss stale pull request approvals when new commits are pushed
    ✅ Require review from Code Owners

  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    Required checks:
      - Code Quality Checks
      - Security Scan
      - Test Suite (ubuntu-latest, node 18)
      - Test Suite (ubuntu-latest, node 20)
      - Build Package

  ✅ Require conversation resolution before merging
  ✅ Require signed commits
  ✅ Require linear history
  ✅ Include administrators

  ✅ Restrict who can push to matching branches
    - Maintainers only

  ✅ Allow force pushes: ❌
  ✅ Allow deletions: ❌
```

### For `develop` branch:

```yaml
Branch Protection Rules:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1

  ✅ Require status checks to pass before merging
    Required checks:
      - Code Quality Checks
      - Test Suite
      - Build Package

  ✅ Require conversation resolution before merging

  ✅ Allow force pushes: ❌
  ✅ Allow deletions: ❌
```

---

## 🚀 Setting Up Branch Protection

### Via GitHub UI:

1. Go to repository **Settings**
2. Click **Branches** in left sidebar
3. Under "Branch protection rules", click **Add rule**
4. Enter branch name pattern: `main`
5. Enable protection rules as specified above
6. Click **Create** or **Save changes**
7. Repeat for `develop` branch

### Via GitHub CLI:

```bash
# Install GitHub CLI
# https://cli.github.com/

# Protect main branch
gh api repos/shreesharma07/numsy/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["Code Quality Checks","Test Suite"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f restrictions=null

# Protect develop branch
gh api repos/shreesharma07/numsy/branches/develop/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["Code Quality Checks","Test Suite"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f restrictions=null
```

---

## 📝 Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

<!-- Describe your changes in detail -->

## Type of Change

- [ ] feat: New feature
- [ ] fix: Bug fix
- [ ] docs: Documentation update
- [ ] style: Code style changes
- [ ] refactor: Code refactoring
- [ ] perf: Performance improvement
- [ ] test: Adding tests
- [ ] build: Build system changes
- [ ] ci: CI configuration changes
- [ ] chore: Maintenance

## Related Issues

<!-- Link related issues here -->

Closes #

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Screenshots (if applicable)

<!-- Add screenshots here -->
```

---

## 🎯 Best Practices

1. **Always work in feature branches** - Never commit directly to `main` or `develop`
2. **Keep branches short-lived** - Merge frequently to avoid conflicts
3. **Write meaningful commit messages** - Follow conventional commits
4. **Update from base branch regularly** - Stay up-to-date with `develop`
5. **Squash commits when merging** - Keep history clean
6. **Delete merged branches** - Keep repository clean
7. **Tag releases** - Use semantic versioning
8. **Review your own PRs first** - Catch obvious issues
9. **Link issues and PRs** - Maintain traceability
10. **Run tests locally** - Don't rely solely on CI

---

## 🔍 Code Review Guidelines

### For Reviewers:

- ✅ Check code quality and style
- ✅ Verify tests are included
- ✅ Ensure documentation is updated
- ✅ Look for potential bugs
- ✅ Check for security issues
- ✅ Verify CI checks pass
- ✅ Be constructive and respectful

### For Authors:

- ✅ Keep PRs small and focused
- ✅ Provide context in description
- ✅ Respond to feedback promptly
- ✅ Address all comments
- ✅ Update PR when requested
- ✅ Thank reviewers for their time

---

## 📊 Monitoring & Metrics

Track these metrics to improve workflow:

- **PR lead time** - Time from PR creation to merge
- **Code review time** - Time waiting for reviews
- **CI success rate** - Percentage of passing builds
- **Hotfix frequency** - Number of hotfixes needed
- **Branch lifetime** - How long branches remain open

---

## 🆘 Troubleshooting

### Cannot push to protected branch

```bash
# Create a feature branch instead
git checkout -b feature/my-change
git push origin feature/my-change
# Then create a Pull Request
```

### CI checks failing

```bash
# Run checks locally first
pnpm run lint
pnpm test
pnpm run build
```

### Merge conflicts

```bash
# Update from base branch
git checkout develop
git pull origin develop
git checkout feature/my-branch
git merge develop
# Resolve conflicts
git add .
git commit -m "chore: resolve merge conflicts"
```

---

## 📚 Additional Resources

- [Git Flow Original Article](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Semantic Versioning](https://semver.org/)
