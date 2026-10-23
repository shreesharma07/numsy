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
pnpm pack --dry-run      # inspect the tarball contents
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `E403 … cannot publish over previously published version` | That version exists. Land a new `fix`/`feat` commit so semantic-release picks the next one |
| npm 24-hour cooldown after an unpublish | `pnpm npm:fix-cooldown [patch\|minor\|major]` bumps and commits with `[skip ci]` |
| `ENEEDAUTH` / `E401` in CI | Recreate `NPM_TOKEN` as an automation token |
| No release happened | Only `chore`/`ci`/`test`/`style` commits since the last tag, or the head commit contains `[skip ci]` |
| Check what's live | `pnpm npm:check` |
