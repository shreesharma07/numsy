# <img src="../../assets/icons/branches.svg" width="28" alt="" /> Branching

[Docs](../README.md) › Maintaining Numsy › Branching

## Branches

| Branch | Lifetime | Branches from | Merges into | Purpose |
| --- | --- | --- | --- | --- |
| `main` | permanent | — | — | Released code; every push can publish |
| `develop` | permanent | `main` | `main` | Integration; publishes `beta` pre-releases |
| `feat/*` | temporary | `main` or `develop` | same | New features |
| `fix/*` | temporary | `main` or `develop` | same | Bug fixes |
| `hotfix/*` | temporary | `main` | `main` + `develop` | Urgent production fixes |
| `release/*` | temporary | `develop` | `main` | Stabilisation; publishes `rc` pre-releases |

## Typical flow

```bash
git switch -c feat/short-name main
# commit with Conventional Commits…
git push -u origin feat/short-name
gh pr create --fill
```

Use **rebase** or **merge commits**, not squash, so each Conventional Commit reaches semantic-release and the changelog.

## Recommended protection

Set under **Settings → Branches**. These are recommendations; they aren't currently enabled.

| Rule | `main` | `develop` |
| --- | :-: | :-: |
| Require a pull request | ✅ | ✅ |
| Required approvals | 1 | 1 |
| Require status check *Build, Test & Security* | ✅ | ✅ |
| Require branches to be up to date | ✅ | — |
| Require conversation resolution | ✅ | ✅ |
| Require linear history | ✅ | — |

> [!NOTE]
> If you enable protection on `main`, allow the release workflow to push its `chore(release)` commit, either through a bypass actor or a PAT used as the semantic-release token.
