# NPM Publish Error - 24 Hour Cooldown

## 🚨 Issue

```
npm error 403 Forbidden - numsy cannot be republished until 24 hours have passed.
```

## 📋 Why This Happens

NPM enforces a 24-hour cooldown when:

1. A package version is published then unpublished
2. A version is published, fails, and you try to republish
3. You're trying to publish a version that already exists

**Your situation:** Version `1.0.0` exists on NPM but cannot be republished yet.

---

## ✅ Solutions (Choose One)

### Option 1: Manual Version Bump (Quickest) ⚡

Manually bump the version to skip the blocked `1.0.0`:

```bash
# Bump to 1.0.1
npm version patch --no-git-tag-version

# Or bump to 1.1.0
npm version minor --no-git-tag-version

# Commit and push
git add package.json
git commit -m "chore: bump version to bypass NPM cooldown [skip ci]"
git push origin main

# Then make a real commit to trigger release
git commit --allow-empty -m "feat: trigger new release"
git push origin main
```

This will let semantic-release start from `1.0.1` or `1.1.0` instead.

---

### Option 2: Wait 24 Hours ⏰

Simply wait until the cooldown expires, then:

```bash
# Re-run the failed workflow
# Visit: https://github.com/shreesharma07/numsy/actions
# Click on failed workflow → "Re-run jobs"
```

---

### Option 3: Configure Graceful Failure (Permanent Fix) 🛠️

Update `.releaserc.json` to skip NPM on failure:

```json
{
  "plugins": [
    // ... existing plugins ...
    [
      "@semantic-release/npm",
      {
        "npmPublish": true,
        "tarballDir": "dist"
      }
    ]
    // ...
  ]
}
```

The workflow will continue even if NPM publish fails.

---

## 🎯 Recommended Solution

**Use Option 1 (Manual Bump)** to immediately fix the issue:

```bash
# Quick fix commands
npm version patch --no-git-tag-version
git add package.json pnpm-lock.yaml
git commit -m "chore: bump to 1.0.1 to bypass NPM cooldown [skip ci]"
git push origin main

# Then trigger a new release
git commit --allow-empty -m "feat: enable CI/CD automation"
git push origin main
```

---

## 🔧 Prevent Future Issues

### Update Workflow to Handle NPM Errors

Add `continue-on-error` for NPM publish step:

```yaml
- name: Run semantic-release
  continue-on-error: true # Don't fail workflow if NPM publish fails
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: npx semantic-release
```

### Or: Skip NPM Publish Temporarily

In `.releaserc.json`:

```json
[
  "@semantic-release/npm",
  {
    "npmPublish": false // Temporarily disable NPM publish
  }
]
```

Then re-enable it later.

---

## 📊 Check Current NPM Status

```bash
# Check if version exists on NPM
npm view numsy versions

# Check latest version
npm view numsy version

# Check package info
npm view numsy
```

---

## 🐛 Debugging

### Check What Version Semantic-Release Will Publish

```bash
# Local dry-run
pnpm run release:dry

# This shows:
# - Current version
# - Next version
# - What would be published
```

### Check Workflow Logs

```bash
# Visit GitHub Actions
# https://github.com/shreesharma07/numsy/actions

# Look for:
# - What version semantic-release tried to publish
# - The exact NPM error
# - Previous successful releases
```

---

## 🎯 Immediate Action Plan

**Right now (to unblock):**

1. **Bump version manually:**

   ```bash
   npm version patch --no-git-tag-version
   ```

2. **Commit with [skip ci]:**

   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "chore: bump to 1.0.1 [skip ci]"
   git push
   ```

3. **Trigger new release:**

   ```bash
   git commit --allow-empty -m "feat: CI/CD pipeline fully operational"
   git push
   ```

**For future (prevention):**

1. **Update workflow** to handle NPM errors gracefully
2. **Never manually unpublish** versions from NPM
3. **Use `npm deprecate`** instead of unpublishing

---

## 📝 Understanding NPM's 24-Hour Rule

**Why NPM does this:**

- Prevents rapid publish/unpublish/republish cycles
- Protects against accidental republishing
- Gives time for CDNs to update

**What you CAN do:**

- Publish a NEW version (e.g., 1.0.1)
- Wait 24 hours then republish same version

**What you CANNOT do:**

- Republish same version within 24 hours
- Force override the cooldown

---

## 🔗 References

- [NPM Unpublish Policy](https://docs.npmjs.com/policies/unpublish)
- [Semantic Release - NPM Plugin](https://github.com/semantic-release/npm)
- [GitHub Actions - Continue on Error](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepscontinue-on-error)

---

## ✅ Quick Fix Command (Copy & Paste)

```bash
# Run this to immediately fix:
npm version patch --no-git-tag-version && \
git add package.json pnpm-lock.yaml && \
git commit -m "chore: bump to 1.0.1 to bypass NPM cooldown [skip ci]" && \
git push origin main && \
git commit --allow-empty -m "feat: enable automated releases" && \
git push origin main

# Then watch: https://github.com/shreesharma07/numsy/actions
```

---

**Issue Created:** 2026-03-07  
**Status:** Awaiting version bump or 24-hour cooldown
