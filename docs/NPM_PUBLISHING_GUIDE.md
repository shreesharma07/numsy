# 📦 NPM Publishing Guide

## Complete Guide to Publishing Number Processor to NPM

This guide walks you through publishing the `@numsy` package to NPM using pnpm.

---

## 📋 Prerequisites

### 1. Install pnpm

If you don't have pnpm installed:

```bash
# Using npm
npm install -g pnpm

# Using Node.js Corepack (recommended)
corepack enable
corepack prepare pnpm@latest --activate

# Verify installation
pnpm --version
```

### 2. Create NPM Account

If you don't have an NPM account:

1. Visit [https://www.npmjs.com/signup](https://www.npmjs.com/signup)
2. Create your account
3. Verify your email

### 3. Login to NPM

```bash
pnpm login
# or
npm login
```

Enter your:

- Username
- Password
- Email (this will be public)

---

## 🚀 Step-by-Step Publishing Process

### Step 1: Update Package Information

Edit `package.json`:

```json
{
  "name": "@numsy",  // Or "@your-username/number-processor"
  "version": "1.0.0",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/number-processor.git"
  }
}
```

**Important:** Change the package name if needed:

- **Scoped package** (recommended): `@your-username/number-processor` or `@your-org/number-processor`
- **Unscoped package**: `number-processor-indian` (must be unique on NPM)

### Step 2: Install Dependencies

```bash
cd Number-Processor
pnpm install
```

This will create `pnpm-lock.yaml` which should be committed to git.

### Step 3: Run Quality Checks

```bash
# Lint the code
pnpm run lint

# Run tests
pnpm test

# Check test coverage
pnpm run test:cov
```

### Step 4: Build the Project

```bash
pnpm run build
```

This creates the `dist/` directory with compiled JavaScript files.

### Step 5: Test the Build Locally

Test your package locally before publishing:

```bash
# Pack the package (creates a .tgz file)
pnpm pack

# This creates: numsy-1.0.0.tgz
```

You can test install it in another project:

```bash
cd /path/to/test-project
pnpm add /path/to/numsy-1.0.0.tgz
```

### Step 6: Verify Package Contents

Check what will be published:

```bash
# List files that will be included
pnpm pack --dry-run
```

Make sure only necessary files are included (no src/, test/, etc.).

### Step 7: Publish to NPM

#### For Public Package (Free)

```bash
pnpm publish --access public
```

#### For Scoped Private Package (Requires Paid Account)

```bash
pnpm publish
```

### Step 8: Verify Publication

1. Visit your package: `https://www.npmjs.com/package/@numsy`
2. Check if all information is correct
3. Test installation:

```bash
pnpm add @numsy
```

---

## 🔄 Updating Your Package

### Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Update Version and Publish

```bash
# Patch update (1.0.0 -> 1.0.1)
pnpm version patch

# Minor update (1.0.0 -> 1.1.0)
pnpm version minor

# Major update (1.0.0 -> 2.0.0)
pnpm version major

# Then publish
pnpm publish --access public
```

The `version` script will automatically:

1. Run format
2. Update version in package.json
3. Create a git commit
4. Create a git tag

Then the `postversion` script will:

1. Push commits to git
2. Push tags to git

---

## 📝 Package.json Explained

### Key Fields for NPM Publishing

```json
{
  "name": "@numsy",     // Package name on NPM
  "version": "1.0.0",                       // Current version
  "description": "...",                      // Shows on NPM
  "main": "dist/main.js",                   // Entry point for require()
  "types": "dist/main.d.ts",                // TypeScript definitions
  "files": [                                 // Files to include in package
    "dist",
    "public",
    "README.md",
    "LICENSE"
  ],
  "keywords": [...],                         // Searchable on NPM
  "author": "Your Name",                     // Your name
  "license": "MIT",                          // License type
  "repository": {...},                       // GitHub repo
  "engines": {                               // Node/pnpm requirements
    "node": ">=16.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"           // Enforces pnpm usage
}
```

---

## 🎯 Using Your Published Package

### Installation

```bash
# Using pnpm
pnpm add @numsy

# Using npm
npm install @numsy

# Using yarn
yarn add @numsy
```

### Usage Example

```typescript
import { PhoneValidatorService } from '@numsy';

const validator = new PhoneValidatorService();

const result = validator.validateAndSanitize('98765-43210');
console.log(result);
// {
//   original: '98765-43210',
//   sanitized: '9876543210',
//   isValid: true
// }
```

---

## 🔒 Publishing Checklist

Before publishing, make sure:

- [ ] Package name is unique or scoped
- [ ] Version number is correct
- [ ] README.md is comprehensive
- [ ] LICENSE file exists
- [ ] All tests pass (`pnpm test`)
- [ ] Code is linted (`pnpm run lint`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] .npmignore excludes unnecessary files
- [ ] Repository URL is correct
- [ ] Author information is correct
- [ ] Keywords are relevant
- [ ] You're logged into NPM (`pnpm login`)

---

## 🛡️ Publishing Best Practices

### 1. Use Git Tags

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Write a Changelog

Create `CHANGELOG.md`:

```markdown
# Changelog

## [1.0.0] - 2026-03-06

### Added
- Initial release
- Phone number validation for Indian numbers
- CSV and Excel file parsing
- Drag-and-drop web interface
```

### 3. Add GitHub Release

After publishing to NPM, create a GitHub release with:

- Tag version
- Release notes
- Binaries (if any)

### 4. Use CI/CD

Set up GitHub Actions for automated publishing:

```yaml
# .github/workflows/publish.yml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm run build
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🚫 Common Issues & Solutions

### Issue 1: Package Name Already Taken

**Solution:** Use a scoped package name:

```json
"name": "@your-username/number-processor"
```

### Issue 2: Need to Login

**Error:** `npm ERR! need auth This command requires you to be logged in.`

**Solution:**

```bash
pnpm login
```

### Issue 3: Two-Factor Authentication

If you have 2FA enabled on NPM:

```bash
pnpm publish --otp=123456
```

Replace `123456` with your 2FA code.

### Issue 4: Private Package

**Error:** `402 Payment Required`

**Solution:** Either:

1. Make it public: `pnpm publish --access public`
2. Upgrade to NPM Pro for private packages

### Issue 5: Files Not Included

Check `.npmignore` and `files` field in package.json.

```bash
# See what will be published
pnpm pack --dry-run
```

---

## 📊 After Publishing

### Monitor Your Package

1. **NPM Stats**: Check downloads at `https://npmjs.com/package/@numsy`
2. **Unpkg**: Check files at `https://unpkg.com/@numsy`
3. **Bundle Size**: Check at `https://bundlephobia.com/`

### Promote Your Package

- Add NPM badge to README:

  ```markdown
  [![npm version](https://badge.fury.io/js/numsy.svg)](https://www.npmjs.com/package/numsy)
  ```

- Share on Twitter/LinkedIn
- Submit to awesome lists
- Write a blog post

---

## 🔄 Unpublishing (Use with Caution)

You can unpublish within 72 hours:

```bash
# Unpublish specific version
pnpm unpublish @numsy@1.0.0

# Unpublish entire package (dangerous!)
pnpm unpublish @numsy --force
```

**Warning:** Unpublishing can break projects that depend on your package!

---

## 📚 Additional Resources

- [NPM Documentation](https://docs.npmjs.com/)
- [pnpm Documentation](https://pnpm.io/)
- [Semantic Versioning](https://semver.org/)
- [NPM Package Best Practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

## 🎉 Quick Command Reference

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Test
pnpm test

# Lint
pnpm run lint

# Create package
pnpm pack

# Publish
pnpm publish --access public

# Update version
pnpm version patch|minor|major

# Login
pnpm login

# Check who you're logged in as
pnpm whoami
```

---

## 📞 Support

If you encounter issues:

1. Check the [NPM status page](https://status.npmjs.org/)
2. Visit [NPM Support](https://www.npmjs.com/support)
3. Open an issue on GitHub

---

**Ready to publish? Run these commands:**

```bash
cd Number-Processor
pnpm install
pnpm run lint
pnpm test
pnpm run build
pnpm publish --access public
```

Good luck! 🚀
