# Snyk security audit: 2026-10-27

[Docs](../README.md) › Reports › Snyk security audit

| | |
| --- | --- |
| **Scope** | `numsy` (root package) and `@numsy/website` workspace |
| **Baseline** | `v2.2.0` (`0430e06`) |
| **Tools** | Snyk CLI 1.1308.3 (org `shreesharma07`) · `pnpm audit` (pnpm 12.15.0) |
| **Result** | All dependency vulnerabilities fixed or formally accepted. 2 Snyk Code findings fixed, 6 reviewed as false positives |

## Summary

| Scan | Command | Before | After |
| --- | --- | --- | --- |
| Open source (Snyk) | `pnpm snyk:test` | ❌ CLI error (missing `--all-projects`). Once run correctly: **1 high, 2 medium** | ✅ No vulnerable paths (1 issue ignored with a reason) |
| Open source (pnpm) | `pnpm audit` | **1 high** (dev only) · prod: 0 | ✅ 0 (1 audited exception) |
| Static analysis | `pnpm snyk:code` | **4 high, 2 medium, 3 low** | 6 open (1 high, 2 medium, 3 low), all reviewed as false positives |
| Infrastructure as code | `snyk iac test` | n/a (no Terraform, Kubernetes, CloudFormation or Dockerfiles in the repo) | n/a |
| Monitoring | `pnpm snyk:monitor` | Not set up | ✅ Snapshots uploaded for both projects; Snyk emails new advisories |

## Dependency findings (Snyk Open Source / pnpm audit)

| ID | Severity | Package | Path | Resolution |
| --- | --- | --- | --- | --- |
| [SNYK-JS-MULTER-21431602](https://security.snyk.io/vuln/SNYK-JS-MULTER-21431602) | High | `multer@2.4.0` (uncaught exception) | `@nestjs/platform-express` → `multer` | **Fixed.** Override `multer@<2.5.0 → >=2.5.0`. `@nestjs/*` updated to 11.2.8 |
| [SNYK-JS-UNZIPPER-18365659](https://security.snyk.io/vuln/SNYK-JS-UNZIPPER-18365659) | Medium | `unzipper@0.10.14` (zip slip) | `exceljs` → `unzipper` | **Fixed.** Override `unzipper@<0.12.5 → >=0.12.5`. Numsy reads workbooks with `xlsx.load`/`xlsx.readFile` (JSZip), not the streaming reader that uses unzipper, so this changes nothing at runtime |
| [SNYK-JS-INFLIGHT-6095116](https://security.snyk.io/vuln/SNYK-JS-INFLIGHT-6095116) | Medium | `inflight@1.0.6` (memory leak) | `exceljs` → `archiver@5` → `archiver-utils` → `glob@7` → `inflight` | **Accepted** in `.snyk` and `website/.snyk` until 2027-04-27. No fixed version exists. exceljs only appends buffers to archives and never calls archiver's glob/directory helpers |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | High | `zod@3.25.76` (memory exhaustion) | `website` → `@codecov/vite-plugin` (dev) → `zod` | **Accepted** via `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`. Build-only tool that validates its own options. No patched 3.x exists, and the plugin uses zod 3-only APIs (single-argument `z.record`, `invalid_type_error`). Not shipped in the npm package or the website bundle |

Production dependencies of the published `numsy` package report **no known vulnerabilities** in either scanner.

## Static analysis findings (Snyk Code)

| Severity | Rule | Location | Verdict |
| --- | --- | --- | --- |
| High | Hardcoded secret | `public/assets/js/pages.js:3` | **Fixed** (false positive): `KEY` was a localStorage key name. Renamed to `STORAGE_KEY` |
| High | Hardcoded secret | `website/src/dashboard/useSettings.ts:4` | **Fixed** (false positive): same change |
| High | Hardcoded secret | `website/src/hooks/useTheme.ts:8` | **Fixed** (false positive): same change |
| High | Path traversal | `src/controllers/app.controller.ts:158` | **Hardened, still reported.** The upload path is now rebuilt from `path.basename(file.filename)` inside the upload directory instead of trusting `file.path`. Multer generates the filename (`upload-<timestamp>-<random>.<csv\|xlsx\|xls>`), the extension is allow-listed, and the containment check remains. Snyk does not model these guards |
| Medium | Path traversal | `src/services/file-parser.service.ts:107` | False positive: `parseFile` validates every path with `isPathAllowed(…, getAllowedDirectories('input'))` before `parseCsv` runs |
| Medium | Path traversal | `src/services/file-parser.service.ts:159` | False positive: same guard, for `parseExcel` |
| Low | Path traversal | `src/cli/index.ts:354` | By design: the CLI writes where its own user points `--output`. The person running the command is not an attacker |
| Low | Path traversal | `src/cli/index.ts:381` | By design: same |
| Low | Path traversal | `src/cli/index.ts:426` | By design: same |

Snyk Code ignores can't be stored in `.snyk`. Mark the six remaining findings as ignored in the Snyk web UI and link back to this report.

## Tooling fixes

| Change | Why |
| --- | --- |
| `snyk:test` / `snyk:monitor` now pass `--all-projects` | Snyk refuses to scan a pnpm workspace without it (`SNYK-CLI-0000`: both `pnpm-lock.yaml` and `pnpm-workspace.yaml` found) |
| `snyk:protect` replaced by `snyk:code` (`snyk code test`) | `snyk protect` was removed from the CLI in March 2022 and only prints a warning |
| `website/.snyk` added | With `--all-projects`, Snyk reads the policy file next to each `package.json`, so the website project ignored the root `.snyk` |
| `.snyk` gains `org: shreesharma07` (for reference) and the `inflight` ignore | The CLI takes the org from `--org`, `snyk config set org=…` or `SNYK_CFG_ORG`, not from `.snyk` |
| Stale, gitignored `website/package-lock.json` removed | npm lockfile left over in a pnpm workspace; it made 1 of 3 Snyk projects fail to resolve |

## Verification

```text
pnpm run validate          biome ci ✔ · tsc ✔ · jest 9 suites / 145 tests ✔
pnpm run build             ✔
pnpm --filter @numsy/website run build   ✔
pnpm snyk:test             Tested 2 projects, no vulnerable paths were found
pnpm audit                 1 ignored (GHSA-mrhx-c7xc-m3w5), 0 open
pnpm audit --prod          No known vulnerabilities found
```

## Follow-ups

- Add the `SNYK_TOKEN` repository secret so the CI Snyk steps produce results. Without it they fail silently (`continue-on-error`).
- Pass `--org=shreesharma07` in the Snyk steps of `main.yml` and `security.yml`.
- Revisit the `inflight` ignore by 2027-04-27, or sooner if exceljs moves to archiver 7 / glob 10+.
- Drop the zod exception when `@codecov/vite-plugin` moves to zod 4.
- Rotate the Snyk token that was shared during this audit.

## How to rerun

```bash
export SNYK_TOKEN=…            # or: snyk auth
pnpm snyk:test --org=shreesharma07
pnpm snyk:code --org=shreesharma07
pnpm snyk:monitor --org=shreesharma07
pnpm audit && pnpm audit --prod
```
