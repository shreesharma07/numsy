# <img src="../../assets/icons/pipeline.svg" width="28" alt="" /> CI/CD

[Docs](../README.md) › Maintaining Numsy › CI/CD

## Workflows

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `main.yml` | push to `main`/`develop`, PRs to `main`, manual | Validate, scan, build, release |
| `security.yml` | weekly (Mon 03:00 UTC) | `pnpm audit`, Snyk, CodeQL |
| `pages.yml` | changes under `website/`, `assets/brand/` or the lockfile on `main`; manual | Build `website/` and deploy it to GitHub Pages |

## `main.yml` jobs

| Job | Runs when | Steps |
| --- | --- | --- |
| **Build, Test & Security** | always | install → `pnpm validate` → audit → Snyk → CodeQL → coverage → Codecov → build → `pnpm pack` → upload artifact |
| **Dependency Review** | pull requests | Fails on moderate+ vulnerabilities in new dependencies |
| **Release & Publish** | push to `main` without `[skip ci]` | build → semantic-release → npm publish |

## Secrets

| Secret | Required | Used by |
| --- | :-: | --- |
| `GITHUB_TOKEN` | automatic | semantic-release (tags, releases, changelog commit) |
| `NPM_TOKEN` | ✅ | npm publish: an npm **automation** token with publish rights to `@numsy` |
| `SNYK_TOKEN` | optional | Snyk scans (steps continue on error) |
| `CODECOV_TOKEN` | optional | Coverage upload |

Add them under **Settings → Secrets and variables → Actions**.

## GitHub Pages

`pages.yml` builds `website/` and deploys it with `actions/deploy-pages`. Every action is pinned to a commit SHA, and only the deploy job gets `pages: write` + `id-token: write`.

One-time setup: **Settings → Pages → Source: GitHub Actions**.
