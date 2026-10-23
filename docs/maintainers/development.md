# <img src="../../assets/icons/setup.svg" width="28" alt="" /> Development

[Docs](../README.md) › Maintaining Numsy › Development

## Setup

| Requirement | Version |
| --- | --- |
| Node.js | 24 for development (≥ 22.22 for commitlint and lint-staged); the package itself supports ≥ 20 |
| pnpm | 12 (`packageManager: pnpm@12.15.0`); settings, overrides and build approvals live in `pnpm-workspace.yaml` |

```bash
git clone https://github.com/shreesharma07/numsy.git && cd numsy
pnpm install          # also installs husky hooks
pnpm validate         # Biome + type-check + tests
```

## Scripts

| Area | Script | Does |
| --- | --- | --- |
| Build | `pnpm build` | swc → `dist/`, then `tsc --emitDeclarationOnly` |
| Run | `pnpm cli -- <args>` | CLI from source |
| | `pnpm serve` / `pnpm serve:prod` | Server from source / from `dist` |
| | `pnpm dev` | nodemon watch mode |
| Quality | `pnpm check` | Biome lint + format with fixes |
| | `pnpm check:ci` | Biome, read-only (CI) |
| | `pnpm type-check` | `tsc --noEmit` |
| | `pnpm validate` | `check:ci` + `type-check` + `test` |
| Tests | `pnpm test` · `test:watch` · `test:cov` · `test:e2e` | Jest |
| Security | `pnpm audit:check` · `pnpm snyk:test` | Dependency scans |
| Release | `pnpm release:dry` · `release:preview` | Preview the next version |
| | `pnpm verify:package` | Check the npm tarball: build output present, no `website/`, `src/`, `docs/` |
| npm | `pnpm npm:check` · `npm:fix-cooldown` | Registry status / [cooldown fix](releasing.md#troubleshooting) |
| Website | `pnpm --filter @numsy/website dev` | Docs site on Vite |

## Tooling

| Tool | Config | Notes |
| --- | --- | --- |
| [Biome](https://biomejs.dev) | `biome.json` | Lint + format; single quotes, trailing commas, 100 cols, LF |
| TypeScript | `tsconfig.json`, `tsconfig.build.json`, `tsconfig.spec.json` | Strict null checks, no implicit any |
| swc | `.swcrc` | CommonJS, ES2021, decorators for NestJS |
| Jest | `package.json#jest` | `ts-jest`, specs in `test/` |
| commitlint | `commitlint.config.js` | Conventional Commits, subject ≤ 100 chars |
| Editor | `.vscode/` | Biome as default formatter, fix-on-save |

## Git hooks

| Hook | Runs |
| --- | --- |
| `pre-commit` | lint-staged → `biome check --write` + related Jest tests on staged files |
| `commit-msg` | commitlint |
| `pre-push` | commitlint (since the remote branch or fork point) → lint → type-check → tests → build |

> [!TIP]
> In commit bodies, write hex colours without `#` (e.g. `FF4D6D`). The commit parser treats `#…` as an issue reference and moves the rest of the body into the footer, which then fails the 100-character footer rule.
