# GitHub Actions Quick Reference

## 🚀 Quick Commands

### Local Validation (Before Push)

```bash
pnpm run validate       # Run all checks (lint + type-check + tests)
pnpm run build          # Ensure build works
pnpm test:cov           # Generate coverage report
```

### Commit Messages for Releases

```bash
# Creates patch release (1.0.0 → 1.0.1)
git commit -m "fix: bug description"

# Creates minor release (1.0.0 → 1.1.0)
git commit -m "feat: new feature description"

# Creates major release (1.0.0 → 2.0.0)
git commit -m "feat!: breaking change description

BREAKING CHANGE: detailed description"

# No release (docs, chore, style, refactor, test)
git commit -m "docs: update README [skip ci]"
```

## 📋 Required Secrets

Add in **Settings → Secrets and variables → Actions:**

| Secret          | Get From                      | Purpose          |
| --------------- | ----------------------------- | ---------------- |
| `NPM_TOKEN`     | npmjs.com → Access Tokens     | Publish to NPM   |
| `CODECOV_TOKEN` | codecov.io → Repository Token | Coverage reports |
| `SNYK_TOKEN`    | snyk.io → Auth Token          | Security scans   |

## 🔄 Active Workflows

| Workflow         | When           | What It Does         |
| ---------------- | -------------- | -------------------- |
| **main.yml**     | Push/PR        | Full CI/CD + Release |
| **publish.yml**  | Manual/Release | Direct NPM publish   |
| **security.yml** | Daily/Push     | Security scans       |

## ⚡ Workflow Triggers

### Automatic

- Push to `main`, `develop`, or feature branches → Runs main.yml
- Open PR → Runs main.yml with dependency review
- Daily 00:00 UTC → Runs security.yml
- Create GitHub Release → Runs publish.yml

### Manual

- Actions tab → Choose workflow → "Run workflow"

## 📊 Where to View Results

| Item            | Location                                 |
| --------------- | ---------------------------------------- |
| Workflow Runs   | `github.com/shreesharma07/numsy/actions` |
| Code Coverage   | `codecov.io/gh/shreesharma07/numsy`      |
| NPM Package     | `npmjs.com/package/@numsy/numsy`         |
| Security Alerts | Repository → Security tab                |

## 🐛 Common Issues

### "NPM 24-hour cooldown"

- **Solution:** Wait 24 hours OR manually bump version:

  ```bash
  pnpm version patch --no-git-tag-version
  git commit -am "chore: bump version [skip ci]"
  git push
  ```

### Tests pass locally but fail in CI

- Check test files are committed
- Verify test data files exist
- Check for OS-specific issues

### Release not triggering

- Ensure using conventional commit format
- Check for `[skip ci]` in commit message
- Verify on `main` branch

## 📦 Workflow Outputs

### Artifacts (Available for 7 days)

- `dist-<sha>` - Built package files
- Build logs and reports

### Generated on Release

- Updated `CHANGELOG.md`
- Git tag (e.g., `v1.0.3`)
- GitHub Release with notes
- NPM package published

## ✅ Pre-Push Checklist

- [ ] Run `pnpm run validate`
- [ ] Check tests pass: `pnpm test`
- [ ] Use conventional commit format
- [ ] Build works: `pnpm run build`
- [ ] No sensitive data in code

## 🔗 Useful Links

- [Full CI/CD Documentation](../docs/CI_CD_SETUP_UPDATED.md)
- [Workflow Details](.github/workflows/README.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)

---

**Status:** ✅ All workflows operational  
**Last Updated:** March 9, 2026
