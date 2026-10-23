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

## Website hosting

The site is built from `website/`. One build-time variable, `SITE_URL`, sets canonical URLs, the sitemap, robots.txt and the base path.

| Target | URL | How it deploys | `SITE_URL` |
| --- | --- | --- | --- |
| **Cloudflare Pages** (primary) | https://numsy.pages.dev | Cloudflare Git integration, or `pnpm --filter @numsy/website deploy:cloudflare` | unset (default) |
| GitHub Pages (alternate) | https://shreesharma07.github.io/numsy | `pages.yml` (needs GitHub Actions) | `https://shreesharma07.github.io/numsy` |

### Cloudflare Pages setup (no GitHub Actions minutes)

1. **Workers & Pages → Create → Pages → Connect to Git** and pick this repository.
2. Build settings: framework **None**, build command `pnpm --filter @numsy/website build`, output directory `website/dist`, root directory `/`.
3. Environment variables: `NODE_VERSION=24`, `PNPM_VERSION=12.15.0` (and `SITE_URL` only for a custom domain, e.g. `https://numsy.example.com`).
4. Every push to `main` then builds on Cloudflare; pull requests get preview URLs.

For a one-off manual deploy: `pnpm dlx wrangler@4 login`, then `pnpm --filter @numsy/website deploy:cloudflare`.
`website/public/_headers` adds security headers and long-lived caching for hashed assets on Cloudflare.

### GitHub Pages

`pages.yml` builds with `SITE_URL=https://shreesharma07.github.io/numsy` and deploys with `actions/deploy-pages`. Every action is pinned to a commit SHA, and only the deploy job gets `pages: write` + `id-token: write`. One-time setup: **Settings → Pages → Source: GitHub Actions**.
