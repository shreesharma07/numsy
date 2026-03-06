# GitHub Actions Setup for CI/CD

This project includes GitHub Actions workflows for automated testing and publishing.

## Workflows

### 1. CI (Continuous Integration)
**File**: `.github/workflows/ci.yml`

Runs on every push and pull request to `main` or `develop` branches.

**Tests on:**
- Ubuntu, Windows, macOS
- Node.js 16, 18, 20

**Steps:**
- Install dependencies
- Run linter
- Run unit tests
- Build project
- Run E2E tests
- Generate coverage report (Ubuntu + Node 18 only)

### 2. Publish to NPM
**File**: `.github/workflows/publish.yml`

Runs when:
- A new GitHub release is created
- Manually triggered via workflow_dispatch

**Steps:**
1. Install dependencies
2. Run linter
3. Run tests
4. Build project
5. Publish to NPM

## Setup Required

### 1. Add NPM Token to GitHub Secrets

1. Get your NPM access token:
   ```bash
   pnpm login
   # Then go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   # Create a new "Automation" token
   ```

2. Add to GitHub:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token
   - Click "Add secret"

### 2. Enable GitHub Actions

1. Go to your repo → Actions tab
2. If asked, click "I understand my workflows, go ahead and enable them"

### 3. Create a Release to Trigger Publishing

```bash
# Create a git tag
git tag v1.0.0
git push origin v1.0.0

# Then create a release on GitHub from that tag
```

Or use the GitHub UI:
- Go to Releases → "Draft a new release"
- Choose tag (or create new: v1.0.0)
- Add release notes
- Click "Publish release"

The publish workflow will automatically trigger!

## Manual Publishing

You can also manually trigger the publish workflow:

1. Go to Actions → Publish to NPM
2. Click "Run workflow"
3. Choose branch
4. Optionally specify version
5. Click "Run workflow"

## Codecov (Optional)

To enable code coverage reporting:

1. Sign up at https://codecov.io
2. Add your repository
3. Get the Codecov token
4. Add it as `CODECOV_TOKEN` in GitHub Secrets

## Workflow Status Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/YOUR_USERNAME/number-processor/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/number-processor/actions/workflows/ci.yml)
[![Publish](https://github.com/YOUR_USERNAME/number-processor/actions/workflows/publish.yml/badge.svg)](https://github.com/YOUR_USERNAME/number-processor/actions/workflows/publish.yml)
```

## Troubleshooting

### Publish fails with authentication error
- Check that NPM_TOKEN secret is set correctly
- Ensure the token has "Automation" type permissions
- Verify token hasn't expired

### Tests fail on specific OS
- Check if there are OS-specific path issues
- Verify all dependencies are compatible

### Coverage upload fails
- Ensure CODECOV_TOKEN is set (if using Codecov)
- This is optional and won't fail the build

## Customization

### Change Node.js Versions

Edit `.github/workflows/ci.yml`:
```yaml
matrix:
  node-version: [18, 20, 22]  # Change these
```

### Skip CI on Certain Commits

Add `[skip ci]` to your commit message:
```bash
git commit -m "Update docs [skip ci]"
```

### Change Trigger Branches

Edit workflow files:
```yaml
on:
  push:
    branches: [ main, develop, staging ]  # Add more branches
```
