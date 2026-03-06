# 🔐 Complete Secrets & Environment Setup Guide

## Overview

This guide covers all required and optional secrets for the CI/CD pipeline.

## 📋 Quick Reference

| Secret          | Required    | Used In       | Purpose                  |
| --------------- | ----------- | ------------- | ------------------------ |
| `GITHUB_TOKEN`  | ✅ Auto     | All workflows | Authentication, releases |
| `NPM_TOKEN`     | ✅ Manual   | Release job   | NPM package publishing   |
| `SNYK_TOKEN`    | ⚠️ Optional | Security scan | Vulnerability scanning   |
| `CODECOV_TOKEN` | ⚠️ Optional | Test coverage | Code coverage reporting  |

## 🎯 Required Secrets

### 1. GITHUB_TOKEN (Automatic ✅)

**No action needed!** GitHub automatically provides this token to all workflows.

**What it does:**

- Authenticates workflow actions
- Creates releases and tags
- Updates CHANGELOG.md via semantic-release
- Comments on issues/PRs

**Permissions configured in workflow:**

```yaml
permissions:
  contents: write
  issues: write
  pull-requests: write
  security-events: write
  id-token: write
```

---

### 2. NPM_TOKEN (Manual Setup Required 🔧)

**Required for publishing packages to NPM** This is the ONLY secret you MUST set up manually.

#### Step-by-Step Setup

**A. Generate NPM Token**

```bash
# 1. Login to NPM (if not already logged in)
npm login

# 2. Generate token via CLI (recommended)
npm token create --type automation

# Or use the web interface:
# Visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# Click "Generate New Token" > Select "Automation" > Copy token
```

**Token format:** `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Important:**

- Use **"Automation"** type (not "Publish" or "Read-only")
- Save the token immediately (you won't see it again!)
- Store it securely

**B. Add to GitHub Secrets**

1. Go to your repository settings:

   ```
   https://github.com/shreesharma07/numsy/settings/secrets/actions
   ```

2. Click **"New repository secret"**

3. Add secret:
   - **Name:** `NPM_TOKEN`
   - **Secret:** Paste your npm token
   - Click **"Add secret"**

4. Verify:
   - Secret appears in list as `NPM_TOKEN`
   - Value is hidden (shows as `***`)

**C. Test the Setup**

```bash
# Make a commit with conventional format
git commit -m "feat: test release automation"
git push origin main

# Watch the workflow run
# Visit: https://github.com/shreesharma07/numsy/actions
```

---

## ⚠️ Optional Secrets

### 3. SNYK_TOKEN (Optional - Security Scanning)

**Enhanced security vulnerability scanning**

#### Setup

**A. Get Token:**

1. Sign up at [snyk.io](https://snyk.io)
2. Go to Account Settings: <https://app.snyk.io/account>
3. Find "General" section
4. Click "Click to show" next to your API token
5. Copy the token

**B. Add to GitHub:**

1. Go to: <https://github.com/shreesharma07/numsy/settings/secrets/actions>
2. Click "New repository secret"
3. Name: `SNYK_TOKEN`
4. Value: Paste your Snyk API token
5. Click "Add secret"

**Benefits:**

- Advanced vulnerability detection
- Dependency monitoring
- Code security analysis
- Automatic security alerts

**Without this token:**

- Security job continues with basic pnpm audit
- No Snyk-specific features

---

### 4. CODECOV_TOKEN (Optional - Coverage Reporting)

**Enhanced code coverage reporting and visualization**

#### Setup

**A. Get Token:**

1. Sign up at [codecov.io](https://codecov.io)
2. Add your GitHub repository
3. Copy the upload token from repository settings

**B. Add to GitHub:**

1. Go to: <https://github.com/shreesharma07/numsy/settings/secrets/actions>
2. Click "New repository secret"
3. Name: `CODECOV_TOKEN`
4. Value: Paste your Codecov token
5. Click "Add secret"

**Benefits:**

- Detailed coverage reports
- PR comments with coverage changes
- Historical coverage tracking
- Coverage badges

**Without this token:**

- Coverage still runs locally
- No uploaded reports to Codecov

---

## 🚀 Verification Checklist

### Immediate Verification (NPM_TOKEN)

After adding NPM_TOKEN, verify:

```bash
# 1. Check secret is set
# Visit: https://github.com/shreesharma07/numsy/settings/secrets/actions
# Confirm: NPM_TOKEN appears in list

# 2. Test the full pipeline
git checkout main
git pull
echo "# test" >> README.md
git add README.md
git commit -m "feat: test CI/CD pipeline"
git push origin main

# 3. Monitor the workflow
# Visit: https://github.com/shreesharma07/numsy/actions
# Watch "CI/CD Pipeline" workflow complete

# 4. Verify release was created (if commit triggered one)
# Visit: https://github.com/shreesharma07/numsy/releases
# Check: https://www.npmjs.com/package/numsy
```

### Optional Tokens Verification

```bash
# For SNYK_TOKEN
# Visit: https://app.snyk.io/org/YOUR_ORG/projects
# Verify: Project appears and is monitored

# For CODECOV_TOKEN
# Visit: https://codecov.io/gh/shreesharma07/numsy
# Verify: Coverage reports are uploaded
```

---

## 🔧 Environment Variables in Workflows

### Automatic Environment Variables

These are set automatically by workflows:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Auto-provided
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }} # From secrets
  GIT_AUTHOR_NAME: semantic-release-bot
  GIT_AUTHOR_EMAIL: semantic-release-bot@numsy.dev
  GIT_COMMITTER_NAME: semantic-release-bot
  GIT_COMMITTER_EMAIL: semantic-release-bot@numsy.dev
```

### Node.js Registry Configuration

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://registry.npmjs.org' # NPM registry
    cache: 'pnpm'
```

---

## 🐛 Troubleshooting

### Issue: "NPM publish failed - authentication required"

**Cause:** NPM_TOKEN not set or invalid

**Solution:**

```bash
# 1. Regenerate token
npm token create --type automation

# 2. Update GitHub secret
# Visit: https://github.com/shreesharma07/numsy/settings/secrets/actions/NPM_TOKEN
# Click "Update" and paste new token

# 3. Re-run workflow
# Visit failed workflow and click "Re-run jobs"
```

### Issue: "Snyk security step failed"

**Cause:** SNYK_TOKEN not set (optional secret)

**Solution:**

- If you want Snyk: Add the token (see setup above)
- If you don't need Snyk: This is expected, security job will use pnpm audit instead

### Issue: "Codecov upload failed"

**Cause:** CODECOV_TOKEN not set (optional secret)

**Solution:**

- If you want Codecov: Add the token (see setup above)
- If you don't need Codecov: The workflow continues successfully (fail_ci_if_error: false)

### Issue: "semantic-release failed - cannot push to protected branch"

**Cause:** Branch protection rules blocking bot commits

**Solution:**

```bash
# Go to: https://github.com/shreesharma07/numsy/settings/branches

# Edit "main" branch protection:
# 1. Navigate to branch protection rules
# 2. Enable "Allow specified actors to bypass required pull requests"
# 3. Add: "github-actions[bot]" to allowed actors
# 4. Save changes
```

### Issue: "No release published"

**Cause:** No conventional commits found, or commits don't trigger release

**Solution:**

```bash
# Ensure commits follow conventional format:
# - feat: triggers minor version (1.0.0 -> 1.1.0)
# - fix: triggers patch version (1.0.0 -> 1.0.1)
# - feat!: or BREAKING CHANGE: triggers major (1.0.0 -> 2.0.0)

# Example valid commits:
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in parser"
git commit -m "feat!: breaking API change"
```

---

## 📚 Additional Resources

### Token Security Best Practices

1. **Never commit tokens** to repository
2. **Use Automation tokens** for CI/CD (not personal tokens)
3. **Rotate tokens** periodically (every 90 days)
4. **Use minimal permissions** required
5. **Monitor token usage** in NPM and GitHub

### NPM Token Permissions

```
Automation token permissions:
- ✅ Publish packages
- ✅ Update package versions
- ✅ Modify package metadata
- ❌ Cannot change account settings
- ❌ Cannot delete packages
```

### Workflow Security

```yaml
# Workflows use:
permissions:
  contents: write # Update CHANGELOG, create tags
  issues: write # Comment on issues
  pull-requests: write # Comment on PRs
  security-events: write # Upload security scan results
  id-token: write # NPM provenance
```

---

## 🎯 Quick Start Summary

**Minimum setup (Required for releases):**

1. Generate NPM automation token: `npm token create --type automation`
2. Add to GitHub secrets as `NPM_TOKEN`
3. Push feat/fix commit to main branch
4. Watch workflow create release automatically

**Optional enhancements:**

- Add `SNYK_TOKEN` for advanced security scanning
- Add `CODECOV_TOKEN` for coverage visualization

**That's it!** 🎉 Your CI/CD pipeline is ready to go.

---

## 📞 Support

**Issues with setup?**

- Check: [GitHub Actions Logs](https://github.com/shreesharma07/numsy/actions)
- Review: [Semantic Release Docs](https://semantic-release.gitbook.io/)
- NPM Help: [NPM Token Docs](https://docs.npmjs.com/creating-and-viewing-access-tokens)

**Last Updated:** 2026-03-07
