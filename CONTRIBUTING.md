<div align="center">
  <img src="assets/brand/numsy-mark.svg" width="64" alt="Numsy" />
  <h1>Contributing to Numsy</h1>
  <p>Bug reports, fixes, docs and ideas are all welcome. Here's how to make them land smoothly.</p>
  <p>
    <a href="README.md">README</a> ·
    <a href="CONTRIBUTING.md"><b>Contributing</b></a> ·
    <a href="CODE_OF_CONDUCT.md">Code of Conduct</a> ·
    <a href="SECURITY.md">Security</a> ·
    <a href="https://shreesharma07.github.io/numsy/">Website</a>
  </p>
</div>

---

## <img src="assets/icons/contribute.svg" width="22" alt="" /> Ways to contribute

| | You want to… | Do this |
| :-: | --- | --- |
| <img src="assets/icons/bug.svg" width="18" alt="" /> | Report a bug | [Open an issue](https://github.com/shreesharma07/numsy/issues/new) with version, OS, the command or code you ran, expected vs. actual output |
| <img src="assets/icons/idea.svg" width="18" alt="" /> | Suggest a feature | Open an issue describing the *problem* before writing code |
| <img src="assets/icons/docs.svg" width="18" alt="" /> | Improve docs | Send a PR directly. Typos and examples are always welcome |
| <img src="assets/icons/commits.svg" width="18" alt="" /> | Fix an issue | Comment on it first so work isn't duplicated |
| <img src="assets/icons/report.svg" width="18" alt="" /> | Report a vulnerability | **Don't open an issue.** Follow [SECURITY.md](SECURITY.md) |

> [!IMPORTANT]
> Never paste real people's phone numbers into issues, tests or fixtures. Use fake ones like `9876501234`.

## <img src="assets/icons/setup.svg" width="22" alt="" /> Setup

Requires **Node.js ≥ 18.3** and **pnpm 8**.

```bash
git clone https://github.com/shreesharma07/numsy.git && cd numsy
pnpm install
pnpm validate        # Biome + type-check + tests (the same gate CI runs)
```

| Command | Purpose |
| --- | --- |
| `pnpm build` | Compile `src/` → `dist/` |
| `pnpm cli -- validate 9876501234` | Run the CLI from source |
| `pnpm serve` | Start the web UI + REST API |
| `pnpm test` · `pnpm test:cov` | Jest, optionally with coverage |
| `pnpm check` | Biome lint + format, with fixes applied |
| `pnpm --filter @numsy/website dev` | Run the docs website locally |

## <img src="assets/icons/layout.svg" width="22" alt="" /> Project layout

```text
src/cli        numsy CLI · terminal output · server launcher
src/core       Numsy facade · Parser · PhoneValidator · FileProcessor
src/common     pure functions · helpers · interfaces · types
src/controllers, src/services   NestJS web server
public/        web UI served by `numsy serve`
test/          Jest specs
website/       documentation site (GitHub Pages)
assets/        brand assets and doc icons
```

## <img src="assets/icons/style.svg" width="22" alt="" /> Code style

[Biome](https://biomejs.dev) formats and lints everything, and the pre-commit hook runs it on staged files.

- Give public APIs explicit types, and avoid `any` in new code.
- Keep `src/common/functions` pure; I/O belongs in `core/` or `cli/`.
- Give every exported symbol a short JSDoc comment.
- Naming: `PascalCase` for classes and types, `camelCase` for functions and variables, `UPPER_SNAKE_CASE` for constants.

## <img src="assets/icons/tests.svg" width="22" alt="" /> Tests

- **Fixes** need a test that fails without the fix.
- **Features** need happy-path and main error-path tests.
- **CLI** behaviour is tested in-process through `run()` in `test/cli.spec.ts`.

## <img src="assets/icons/commits.svg" width="22" alt="" /> Commits & pull requests

Commits follow [Conventional Commits](https://www.conventionalcommits.org); they drive versioning and the changelog.

```text
feat(cli): add --only unique option
fix(parser): read hyperlink cells in xlsx files
docs: clarify country-code formatting
```

| Type | Releases | Use for |
| --- | :-: | --- |
| `feat` | minor | New capability |
| `fix` · `perf` · `refactor` · `docs` | patch | Bug fixes, speed-ups, restructuring, published docs |
| `chore` · `ci` · `test` · `style` | none | Tooling, pipelines, tests, formatting |

Breaking change? Add a `BREAKING CHANGE:` footer, which triggers a major release.

1. Fork, then branch off `main`: `feat/…` or `fix/…`
2. Make the change, add tests, and run `pnpm validate`
3. Open a focused PR that explains **what** and **why**, and links the issue

## <img src="assets/icons/release.svg" width="22" alt="" /> Releases

Merges to `main` run CI. Then [semantic-release](https://semantic-release.gitbook.io) publishes to npm, tags the release and updates [CHANGELOG.md](CHANGELOG.md). Never bump versions by hand.

## <img src="assets/icons/questions.svg" width="22" alt="" /> Questions

Ask in [issues](https://github.com/shreesharma07/numsy/issues) or reach the maintainer via [shrikumarsharma.in](https://shrikumarsharma.in).

---

<p align="center">
  <img src="assets/brand/numsy-mark.svg" width="28" alt="" /><br />
  <sub>Built by <a href="https://shrikumarsharma.in">Shri Kumar Sharma</a> · <a href="https://github.com/shreesharma07">GitHub</a> · <a href="https://www.linkedin.com/in/shreesharma07/">LinkedIn</a></sub>
</p>
