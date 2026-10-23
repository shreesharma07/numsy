# <img src="../../assets/icons/release.svg" width="28" alt="" /> Releasing

[Docs](../README.md) › Maintaining Numsy › Releasing

Releases are fully automated with [semantic-release](https://semantic-release.gitbook.io). **Never bump `version` by hand.**

## Flow

```text
push to main → CI validates → semantic-release reads commits since the last tag
            → decides the version → updates CHANGELOG.md + package.json
            → commits "chore(release): x.y.z [skip ci]" → tags vX.Y.Z
            → creates the GitHub release → npm publish
```

## Version rules

| Commit type | Release |
| --- | --- |
| `BREAKING CHANGE:` footer | major |
| `feat` | minor |
| `fix` · `perf` · `refactor` · `docs` · `build` · `revert` | patch |
| `chore` · `ci` · `test` · `style` | none |

## Channels

| Branch | npm dist-tag | Example |
| --- | --- | --- |
| `main` | `latest` | `1.2.0` |
| `develop` | `beta` | `1.3.0-beta.1` |
| `release/*` | `rc` | `1.3.0-rc.1` |

## Before you merge

```bash
pnpm release:preview     # summarise the commits that will ship
pnpm release:dry         # dry-run semantic-release (needs GITHUB_TOKEN)
pnpm build && pnpm verify:package   # tarball must contain dist/ and nothing from website/ or src/
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `E403 … cannot publish over previously published version` | That version exists. Land a new `fix`/`feat` commit so semantic-release picks the next one |
| npm 24-hour cooldown after an unpublish | `pnpm npm:fix-cooldown [patch\|minor\|major]` bumps and commits with `[skip ci]` |
| `ENEEDAUTH` / `E401` in CI | Recreate `NPM_TOKEN` as an automation token |
| No release happened | Only `chore`/`ci`/`test`/`style` commits since the last tag, or the head commit contains `[skip ci]` |
| Check what's live | `pnpm npm:check` |

## Milestone & audit tags

Besides the `vX.Y.Z` tags created by semantic-release, key commits carry annotated tags for tracing and audits.
semantic-release only reads `v*` tags, so these never affect versioning.

| Prefix | Marks | Example |
| --- | --- | --- |
| `milestone/<name>` | A significant feature or migration | `milestone/cli`, `milestone/pnpm12-node20` |
| `audit/<yyyy-mm-dd>-<topic>` | A security fix or dependency audit, with findings in the tag message | `audit/2026-10-23-dependencies` |

```bash
git tag -l "milestone/*" "audit/*" -n9          # list with messages
git tag -a audit/2026-11-01-deps <sha> -m "…"   # create
git push origin audit/2026-11-01-deps           # push one tag per push (bulk tag pushes are rejected)
```
