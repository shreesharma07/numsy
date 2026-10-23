<p align="center">
  <a href="https://numsy.pages.dev/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/brand/numsy-banner-dark.svg" />
      <img src="assets/brand/numsy-banner.svg" alt="Numsy — validate, sanitize and extract Indian mobile numbers" width="100%" />
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/numsy"><img src="https://badgen.net/npm/v/numsy?icon=npm&color=FF4D6D" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/numsy"><img src="https://badgen.net/npm/dw/numsy?icon=npm&color=FFB703&label=downloads" alt="npm weekly downloads" /></a>
  <a href="https://www.npmjs.com/package/numsy"><img src="https://badgen.net/npm/node/numsy?color=111111" alt="Node.js version" /></a>
  <a href="https://www.npmjs.com/package/numsy"><img src="https://badgen.net/npm/types/numsy?icon=typescript&color=8338EC" alt="TypeScript types" /></a>
  <a href="https://packagephobia.com/result?p=numsy"><img src="https://badgen.net/packagephobia/install/numsy?color=555" alt="install size" /></a>
  <a href="LICENSE"><img src="https://badgen.net/npm/license/numsy?color=111111" alt="MIT license" /></a>
  <br />
  <a href="https://github.com/shreesharma07/numsy/releases"><img src="https://badgen.net/github/release/shreesharma07/numsy?icon=github&color=FF4D6D" alt="GitHub release" /></a>
  <a href="https://github.com/shreesharma07/numsy/stargazers"><img src="https://badgen.net/github/stars/shreesharma07/numsy?icon=github&color=8338EC" alt="GitHub stars" /></a>
  <a href="https://github.com/shreesharma07/numsy/commits/main"><img src="https://badgen.net/github/last-commit/shreesharma07/numsy/main?icon=github&color=FFB703" alt="last commit" /></a>
  <a href="https://github.com/shreesharma07/numsy/graphs/contributors"><img src="https://badgen.net/github/contributors/shreesharma07/numsy?icon=github&color=111111" alt="contributors" /></a>
  <a href="https://github.com/shreesharma07/numsy/issues"><img src="https://badgen.net/github/open-issues/shreesharma07/numsy?icon=github&color=0B7A4B" alt="open issues" /></a>
  <br />
  <a href="https://codecov.io/gh/shreesharma07/numsy"><img src="https://codecov.io/gh/shreesharma07/numsy/graph/badge.svg?token=A9H550XJVW" alt="codecov" /></a>
  <a href="https://github.com/shreesharma07/numsy/actions/workflows/main.yml"><img src="https://img.shields.io/github/actions/workflow/status/shreesharma07/numsy/main.yml?branch=main&style=flat-square&label=CI" alt="CI status" /></a>
  <a href="https://badge.socket.dev/npm/package/numsy/2.1.0"><img src="https://badge.socket.dev/npm/package/numsy/2.1.0" alt="Socket security score" /></a>
  <a href="#local-dashboard"><img src="https://badgen.net/badge/dashboard/localhost%3A6789/8338EC" alt="Local dashboard on localhost:6789" /></a>
  <a href="#privacy"><img src="https://badgen.net/badge/privacy/no%20storage%20%C2%B7%20no%20AI%20training/0B7A4B" alt="Privacy: no storage, no AI training" /></a>
  <a href="#built-with-claude"><img src="https://badgen.net/badge/built%20with/Claude%20Code/8338EC" alt="Built with Claude Code" /></a>
</p>

<p align="center">
  <a href="https://numsy.pages.dev/"><b>Website</b></a> ·
  <a href="https://numsy.pages.dev/playground/">Playground</a> ·
  <a href="docs/README.md">Docs</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="SECURITY.md">Security</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

**Numsy** validates, sanitizes, extracts and de-duplicates Indian mobile numbers from text, CSV and Excel. Use it as a typed TypeScript library, a CLI, a local dashboard on `localhost:6789`, or the [playground](https://numsy.pages.dev/playground/) in your browser. One engine powers all four, so they always agree.

## <img src="assets/icons/install.svg" width="22" alt="" /> Install

```bash
npm install numsy@latest        # library
npm install -g numsy@latest     # CLI → numsy
npx numsy@latest --help         # or run it without installing
```

> [!NOTE]
> Numsy moved from `@numsy/numsy` to `numsy` in 2.1.0. Replace the old package with `npm i numsy@latest`; the API is the same.

## <img src="assets/icons/quickstart.svg" width="22" alt="" /> Quick start

```bash
numsy validate 9876501234 "+91 98765 43210"
numsy process contacts.xlsx -f json,csv,xlsx -d reports
numsy process leads.csv --dedupe --only valid --columns numbers --header-name Mobile -o clean.csv
numsy dashboard --open          # http://localhost:6789
```

```ts
import { Numsy } from 'numsy';

const numsy = new Numsy({ enableLogging: false });
numsy.validate('+91 98765 01234'); // → { sanitized: '9876501234', isValid: true, … }

const report = await numsy.analyzeFile('contacts.xlsx', { dedupe: 'first' });
report.analytics; // → { totalValidNumbers, uniqueValidNumbers, duplicatesRemoved, … }
```

## <img src="assets/icons/rest.svg" width="22" alt="" /> Local dashboard

`numsy dashboard` opens a dashboard on [`http://localhost:6789`](http://localhost:6789). Drop in a CSV or Excel file (up to 50 MB) or paste text, tune the filters, browse the results and export exactly the rows you need.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/screens/dashboard-dark.png" />
    <img src="assets/screens/dashboard-light.png" alt="Numsy dashboard showing 1,200 sample rows with valid, invalid, unique and duplicate counts" width="100%" />
  </picture>
</p>

| Area | Options | CLI equivalent |
| --- | --- | --- |
| Filters | Keep all, first or last duplicate · reject dummy numbers · first number per cell · skip empty cells | `--dedupe` `--keep` `--loose` `--first-only` `--skip-empty` |
| Columns | Auto-detected phone and name columns, or your choice | `--column` `--name-column` |
| Rows | All · Valid · Invalid · Unique · Duplicates, with search and paging | `--only` |
| Output | `9876501234` · `+919876501234` · `+91 98765 01234` · name + number only · custom number header · header row on or off · max rows | `--number-style` `--columns` `--header-name` `--no-header` `--max-rows` |
| Export | CSV · Excel · JSON · Markdown · Text | `-f csv,xlsx,json,md,txt` |

It runs on your machine only: it listens on `127.0.0.1`, keeps uploads in memory and makes no requests to the internet. The same dashboard runs in the [website playground](https://numsy.pages.dev/playground/), where a Web Worker does the work inside your browser tab. The server also exposes a [REST API](docs/guides/rest-api.md) for scripts.

## <img src="assets/icons/tests.svg" width="22" alt="" /> Performance

| Workload | Time |
| --- | --- |
| Validate 100,000 numbers | **89 ms** (about 1.1 million per second) |
| Validate 1,000,000 numbers | **0.82 s** |
| Analyse + de-duplicate 500,000 rows | **1.8 s** |
| Real 11.7 MB Excel export, 505,277 rows | read in 8.7 s, analysed in 2.2 s |

Measured on an AMD Ryzen 7 laptop with Node.js 24. See [Performance](docs/guides/performance.md) for the method, the full tables and how to run `node scripts/benchmark.js` yourself.

## <img src="assets/icons/supported.svg" width="22" alt="" /> Privacy

Numsy never receives your data. The library, CLI and local dashboard run on your computer; the playground runs in your browser. Numsy **does not store** file contents, **never sells or shares** them with third parties, and **never uses them for AI training**. Read the [privacy & data disclaimer](https://numsy.pages.dev/privacy/).

## <img src="assets/icons/docs.svg" width="22" alt="" /> Documentation

| | |
| --- | --- |
| **Website** | [Getting started](https://numsy.pages.dev/docs/) · [CLI](https://numsy.pages.dev/docs/cli/) · [API](https://numsy.pages.dev/docs/api/) · [Local dashboard](https://numsy.pages.dev/docs/web-ui/) · [Formats](https://numsy.pages.dev/docs/formats/) · [FAQ](https://numsy.pages.dev/docs/faq/) |
| **Try it** | [Playground](https://numsy.pages.dev/playground/): upload, filter and export in your browser; nothing is uploaded |
| **In this repo** | [`docs/`](docs/README.md): [CLI](docs/guides/cli.md) · [Library](docs/guides/library.md) · [Dashboard & REST API](docs/guides/rest-api.md) · [Performance](docs/guides/performance.md) |

## <img src="assets/icons/community.svg" width="22" alt="" /> Community

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

<p>
  <a href="https://github.com/shreesharma07/numsy/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=shreesharma07/numsy" alt="Contributors" />
  </a>
</p>

## <img src="assets/icons/ai.svg" width="22" alt="" /> Built with Claude

<table>
  <tr>
    <td>
      <h3>Vibe-coded with Claude ✨</h3>
      <p>
        Numsy 2.x was built in collaboration with
        <a href="https://claude.ai"><b>Claude</b></a>, Anthropic's AI, through
        <a href="https://claude.com/claude-code"><b>Claude Code</b></a>. That covers the <code>numsy</code> CLI,
        the shared engine, the local dashboard and playground, the exporters, the tests, these docs,
        the brand identity and the website.
      </p>
      <p>
        Shri Kumar Sharma set the direction, made the product calls and owns the result.
        Claude wrote the code, tests and docs alongside him.
      </p>
      <p>
        <a href="https://claude.com/claude-code">Try Claude Code →</a>
      </p>
    </td>
  </tr>
</table>

## <img src="assets/icons/license.svg" width="22" alt="" /> License

[MIT](LICENSE) © [Shri Kumar Sharma](https://shrikumarsharma.in)

---

<p align="center">
  <img src="assets/brand/numsy-mark.svg" width="28" alt="" /><br />
  <sub>Built by <a href="https://shrikumarsharma.in">Shri Kumar Sharma</a> with <a href="https://claude.com/claude-code">Claude Code</a> · <a href="https://github.com/shreesharma07">GitHub</a> · <a href="https://www.linkedin.com/in/shreesharma07/">LinkedIn</a><br />Website hosted and deployed on <a href="https://pages.cloudflare.com">Cloudflare Pages</a> · Coverage by <a href="https://codecov.io/gh/shreesharma07/numsy">Codecov</a></sub>
</p>
