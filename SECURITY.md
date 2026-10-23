<div align="center">
  <img src="assets/brand/numsy-mark.svg" width="64" alt="Numsy" />
  <h1>Security Policy</h1>
  <p>How to report a vulnerability, what to expect, and how to run Numsy safely.</p>
  <p>
    <a href="README.md">README</a> ·
    <a href="CONTRIBUTING.md">Contributing</a> ·
    <a href="CODE_OF_CONDUCT.md">Code of Conduct</a> ·
    <a href="SECURITY.md"><b>Security</b></a> ·
    <a href="https://shreesharma07.github.io/numsy/">Website</a>
  </p>
</div>

---

## <img src="assets/icons/supported.svg" width="22" alt="" /> Supported versions

| Version | Supported |
| --- | :-: |
| 1.x | ✅ |
| < 1.0 | ❌ |

Fixes ship as patch releases of the latest 1.x.

## <img src="assets/icons/report.svg" width="22" alt="" /> Reporting a vulnerability

> [!CAUTION]
> **Do not open a public issue.** Report privately through [GitHub private vulnerability reporting](https://github.com/shreesharma07/numsy/security/advisories/new).
> If that's unavailable, ask for a private channel via [shrikumarsharma.in](https://shrikumarsharma.in), and leave exploit details out of that first message.

Please include:

- **Version** and how you installed it (npm, global CLI, source)
- **Component**: library, CLI, or `numsy serve`
- **Steps to reproduce**, ideally with a minimal input file and no real personal data
- **Impact**, as you understand it

## <img src="assets/icons/timeline.svg" width="22" alt="" /> What to expect

| Stage | Target |
| --- | --- |
| Acknowledgement | ≤ 3 working days |
| Initial assessment | ≤ 7 days |
| Fix for confirmed issues | typically ≤ 30 days |

You'll get progress updates, credit in the release notes (unless you'd rather stay anonymous), and coordinated disclosure.

## <img src="assets/icons/model.svg" width="22" alt="" /> Security model

| Area | What Numsy does | What you should do |
| --- | --- | --- |
| **Data** | Library and CLI run locally and make no network calls | Treat phone numbers as personal data (e.g. India's DPDP Act 2023) |
| **`numsy serve`** | Local dev server: open CORS, listens on all interfaces, auto-deletes uploads | Don't expose it publicly without a proxy, auth and upload limits |
| **CSV output** | Neutralises formula cells (`=`, `@`, non-numeric `+`/`-`); keeps `+91 …` intact | Still be careful opening untrusted files in spreadsheets |
| **Terminal output** | Strips control characters from file contents before printing | No action needed |

## <img src="assets/icons/deps.svg" width="22" alt="" /> Dependencies

CI runs `pnpm audit`, Snyk, CodeQL and dependency review. Vulnerable transitive packages are pinned through `pnpm.overrides` in `package.json`.

---

<p align="center">
  <img src="assets/brand/numsy-mark.svg" width="28" alt="" /><br />
  <sub>Built by <a href="https://shrikumarsharma.in">Shri Kumar Sharma</a> with <a href="https://claude.com/claude-code">Claude Code</a> · <a href="https://github.com/shreesharma07">GitHub</a> · <a href="https://www.linkedin.com/in/shreesharma07/">LinkedIn</a></sub>
</p>
