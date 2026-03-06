# GitHub Secrets Configuration Guide

## 🔑 Required Secrets for CI/CD

### ✅ GITHUB_TOKEN (Automatic - No Setup Needed!)

**The `GITHUB_TOKEN` is automatically provided by GitHub Actions** - you don't need to create it manually!

GitHub Actions automatically creates a `GITHUB_TOKEN` secret for every workflow run with these permissions:

- Read repository content
- Write commits and tags
- Create releases
- Comment on issues/PRs

**Our workflow is already configured to use it:**

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

No action required! ✅

---

### 📦 NPM_TOKEN (Manual Setup Required)

This token is needed to publish packages to NPM.

#### Step 1: Generate NPM Token

1. **Login to NPM:**

   ```bash
   npm login
   ```

2. **Create an Automation Token:**
   - Go to: <https://www.npmjs.com/settings/YOUR_USERNAME/tokens>
   - Click "Generate New Token"
   - Select **"Automation"** type (for CI/CD)
   - Name it: "GitHub Actions - numsy"
   - Click "Generate Token"
   - **Copy the token immediately** (you won't see it again!)

   Example token format: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Step 2: Add NPM Token to GitHub

1. **Go to Repository Settings:**
   - Navigate to: <https://github.com/shreesharma07/numsy/settings/secrets/actions>

2. **Add New Secret:**
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your NPM token
   - Click "Add secret"

3. **Verify:**
   - The secret should appear in the list as `NPM_TOKEN`
   - The value will be hidden (shows as `***`)

---

## 🔒 Optional: SNYK_TOKEN (For Security Scanning)

If you want Snyk security scanning in CI:

#### Step 1: Get Snyk Token

1. Go to: <https://app.snyk.io/account>
2. Click "Show" to reveal your API token
3. Copy the token

#### Step 2: Add to GitHub

1. Go to: <https://github.com/shreesharma07/numsy/settings/secrets/actions>
2. Click "New repository secret"
3. Name: `SNYK_TOKEN`
4. Value: Paste your Snyk token
5. Click "Add secret"

---

## 🚀 Testing the Setup

### After adding NPM_TOKEN

1. **Commit and push:**

   ```bash
   git commit -m "feat: test semantic-release"
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to: <https://github.com/shreesharma07/numsy/actions>
   - Watch the "Release" workflow run
   - It should complete successfully!

3. **Verify Release:**

   ```bash
   # Check if package was published
   npm view numsy version

   # Check if tag was created
   git fetch --tags
   git tag -l

   # Check GitHub releases
   # Visit: https://github.com/shreesharma07/numsy/releases
   ```

---

## ⚠️ Troubleshooting

### Error: "No GitHub token specified"

**This error happens when running locally**, not in CI. In GitHub Actions, the token is automatic.

**Solution:** Use the preview script locally:

```bash
pnpm run release:preview
```

### Error: "npm publish failed"

**Cause:** NPM_TOKEN not set or invalid

**Solution:**

1. Verify token exists: <https://github.com/shreesharma07/numsy/settings/secrets/actions>
2. Check token is "Automation" type
3. Regenerate token if needed

### Error: "Permission denied to push"

**Cause:** Checkout doesn't have proper credentials

**Solution:** Already fixed! The workflow now uses:

```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📋 Quick Checklist

Before pushing to main:

- [x] GITHUB_TOKEN - Automatic ✅
- [ ] NPM_TOKEN - Add to GitHub Secrets
- [ ] SNYK_TOKEN (optional) - Add if using Snyk
- [ ] Test with `pnpm run release:preview`
- [ ] Push and monitor workflow: <https://github.com/shreesharma07/numsy/actions>

---

## 🎯 Environment Variables Summary

| Variable       | Where                      | Required    | How to Get                              |
| -------------- | -------------------------- | ----------- | --------------------------------------- |
| `GITHUB_TOKEN` | GitHub Actions (automatic) | ✅ Yes      | Automatic - no action needed            |
| `NPM_TOKEN`    | GitHub Secrets (manual)    | ✅ Yes      | <https://www.npmjs.com/settings/tokens> |
| `SNYK_TOKEN`   | GitHub Secrets (manual)    | ⚠️ Optional | <https://app.snyk.io/account>           |

---

## 🔐 ⚠️ Security Warning

**NEVER commit tokens to git!**

- ❌ Don't put tokens in `.env` files
- ❌ Don't put tokens in code
- ❌ Don't share tokens in chat/email
- ✅ Always use GitHub Secrets
- ✅ Rotate tokens if exposed

If you accidentally committed a token:

1. **Revoke it immediately** on NPM/Snyk
2. Generate a new one
3. Update GitHub Secrets
4. Remove from git history: `git filter-branch` or BFG Repo-Cleaner

---

**Last Updated:** March 6, 2026
**Status:** ✅ Ready for Production
