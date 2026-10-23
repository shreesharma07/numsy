<p align="center">
  <a href="https://shreesharma07.github.io/numsy/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/brand/numsy-banner-dark.svg" />
      <img src="assets/brand/numsy-banner.svg" alt="Numsy — validate, sanitize and extract Indian mobile numbers" width="100%" />
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@numsy/numsy"><img src="https://img.shields.io/npm/v/@numsy/numsy?style=flat-square&color=FF4D6D&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@numsy/numsy"><img src="https://img.shields.io/npm/dw/@numsy/numsy?style=flat-square&color=FFB703&label=downloads" alt="npm downloads" /></a>
  <a href="https://github.com/shreesharma07/numsy/actions/workflows/main.yml"><img src="https://img.shields.io/github/actions/workflow/status/shreesharma07/numsy/main.yml?branch=main&style=flat-square&label=CI" alt="CI status" /></a>
  <a href="https://github.com/shreesharma07/numsy/stargazers"><img src="https://img.shields.io/github/stars/shreesharma07/numsy?style=flat-square&color=8338EC" alt="GitHub stars" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="https://shreesharma07.github.io/numsy/"><b>Website</b></a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="CODE_OF_CONDUCT.md">Code of Conduct</a> ·
  <a href="SECURITY.md">Security</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

**Numsy** validates, sanitizes, extracts and de-duplicates Indian mobile numbers from text, CSV and Excel. It ships as a typed TypeScript library, a CLI and a local web UI.

## <img src="assets/icons/install.svg" width="22" alt="" /> Install

```bash
npm install @numsy/numsy        # library
npm install -g @numsy/numsy     # CLI → numsy
```

## <img src="assets/icons/quickstart.svg" width="22" alt="" /> Quick start

```bash
numsy validate 9876501234 "+91 98765 43210"
numsy process contacts.xlsx -f json,csv,xlsx -d reports
```

```ts
import { Numsy } from '@numsy/numsy';

const numsy = new Numsy({ enableLogging: false });
numsy.validate('+91 98765 01234'); // → { sanitized: '9876501234', isValid: true, … }
```

## <img src="assets/icons/docs.svg" width="22" alt="" /> Documentation

Guides, the full CLI and API reference, output formats, a browser-only playground and the FAQ live on
**[shreesharma07.github.io/numsy](https://shreesharma07.github.io/numsy/)**.

## <img src="assets/icons/community.svg" width="22" alt="" /> Community

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

<p>
  <a href="https://github.com/shreesharma07/numsy/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=shreesharma07/numsy" alt="Contributors" />
  </a>
</p>

## <img src="assets/icons/license.svg" width="22" alt="" /> License

[MIT](LICENSE) © [Shri Kumar Sharma](https://shrikumarsharma.in)

---

<p align="center">
  <img src="assets/brand/numsy-mark.svg" width="28" alt="" /><br />
  <sub>Built by <a href="https://shrikumarsharma.in">Shri Kumar Sharma</a> · <a href="https://github.com/shreesharma07">GitHub</a> · <a href="https://www.linkedin.com/in/shreesharma07/">LinkedIn</a></sub>
</p>
