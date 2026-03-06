# 🚀 Quick Start: Publishing to NPM

## Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

## Step-by-Step Publishing

### 1. Update Package Info

Edit `package.json` and change:

- `"name"`: Change from `@numsy` to your own scope/name
- `"author"`: Add your name
- `"repository.url"`: Add your GitHub repo URL

### 2. Install Dependencies

```bash
cd "d:\Razorpod Applications\Number-Processor"
pnpm install
```

### 3. Login to NPM

```bash
pnpm login
```

Enter your NPM username, password, and email.

### 4. Run Tests & Build

```bash
pnpm run lint
pnpm test
pnpm run build
```

### 5. Publish

```bash
pnpm publish --access public
```

---

## ✅ Done

Your package is now published at:
`https://npmjs.com/package/@your-scope/number-processor`

Users can install it with:

```bash
pnpm add @your-scope/number-processor
```

---

## 🔄 Updating Your Package

### Patch Update (Bug Fixes: 1.0.0 → 1.0.1)

```bash
pnpm version patch
pnpm publish --access public
```

### Minor Update (New Features: 1.0.0 → 1.1.0)

```bash
pnpm version minor
pnpm publish --access public
```

### Major Update (Breaking Changes: 1.0.0 → 2.0.0)

```bash
pnpm version major
pnpm publish --access public
```

---

## 📝 Complete Guide

For detailed instructions, see: **[NPM_PUBLISHING_GUIDE.md](NPM_PUBLISHING_GUIDE.md)**
