# <img src="../../assets/icons/rest.svg" width="28" alt="" /> Local dashboard & REST API

[Docs](../README.md) › Using Numsy › Local dashboard & REST API

```bash
numsy dashboard            # http://localhost:6789
numsy dashboard --open     # also opens your browser
numsy dashboard -p 8080    # custom port (or PORT=8080)
```

If the port is busy, the next free one is used. The dashboard is the same interface as the [website playground](https://numsy.pages.dev/playground/), but the Numsy server on your machine does the work, so large workbooks stay fast and nothing touches the internet.

> [!NOTE]
> The server listens on `127.0.0.1`, accepts same-origin requests only and rejects unknown `Host` headers. Use `--host 0.0.0.0` only on a trusted network; see [SECURITY.md](../../SECURITY.md).

## The dashboard

| Area | What you can do |
| --- | --- |
| Input | Drop or browse a `.csv` / `.xlsx` file (≤ 50 MB), try synthetic sample data, or paste text |
| Columns | Auto-detected phone and name columns, or pick them yourself |
| Filters | Keep all / keep first / keep last duplicates, reject dummy numbers, first number per cell, skip empty cells |
| Results | Summary tiles, a valid / duplicate / invalid bar, row-set tabs, search, paging and an all-columns view |
| Output | Number style, name + number only, custom number header, header row on or off, max rows |
| Export | CSV, Excel, JSON, Markdown or text, built exactly like `numsy process` |

Every setting maps to a CLI flag:

| Setting | CLI flag |
| --- | --- |
| Phone / name column | `--column`, `--name-column` |
| Duplicates | `--dedupe`, `--keep first\|last` |
| Reject dummy numbers (off) | `--loose` |
| Only the first number per cell | `--first-only` |
| Skip empty phone cells | `--skip-empty` |
| Row-set tab | `--only` |
| Number style | `--number-style` |
| Columns | `--columns` |
| Number column header | `--header-name` |
| Include header row (off) | `--no-header` |
| Max rows to export | `--max-rows` |

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Dashboard |
| `GET` | `/api` | REST API reference page |
| `GET` | `/api/health-page` | Health page |
| `GET` | `/api/meta` | Version, limits, formats and default settings |
| `POST` | `/api/parse` | Parse an upload (multipart field `file`) in memory and open a session |
| `POST` | `/api/text` | Open a session for pasted text: `{ text, mode: "extract" \| "validate" }` |
| `POST` | `/api/view` | `{ sessionId, settings, query }` → counts, summary and one page of rows |
| `POST` | `/api/export` | `{ sessionId, format, settings }` → the file as an attachment |
| `POST` | `/api/analyze` | One-shot: multipart `file` + settings fields → full analysis report |
| `DELETE` | `/api/session/:id` | Forget a session now |
| `GET` | `/api/health` | `{ "status": "OK", "timestamp": "…" }` |
| `POST` | `/api/upload` | Legacy 1.x upload; returns a `downloadId` |
| `GET` | `/api/download/:id` | Legacy ZIP report for a `downloadId` |

## Example

```bash
# 1. Parse a file into a session
curl -F "file=@contacts.xlsx" http://localhost:6789/api/parse
```

```jsonc
{
  "sessionId": "8f6c…",
  "kind": "file",
  "name": "contacts.xlsx",
  "totalRows": 1200,
  "columns": ["Name", "Mobile Number", "City"],
  "detected": { "phoneColumn": "Mobile Number", "nameColumn": "Name" },
  "parseMs": 41
}
```

```bash
# 2. Page through the de-duplicated valid rows
curl -H "Content-Type: application/json" http://localhost:6789/api/view \
  -d '{"sessionId":"8f6c…","settings":{"dedupe":"first","only":"valid"},"query":{"page":1,"pageSize":50}}'

# 3. Export them as Excel with a "Mobile" column
curl -OJ -H "Content-Type: application/json" http://localhost:6789/api/export \
  -d '{"sessionId":"8f6c…","format":"xlsx","settings":{"dedupe":"first","only":"valid","numberHeader":"Mobile"}}'
```

## Settings

All fields are optional; unknown or invalid values fall back to the default.

| Field | Values | Default |
| --- | --- | --- |
| `phoneColumn` | column name | auto-detect |
| `nameColumn` | column name, `none` | auto-detect |
| `dedupe` | `off`, `first`, `last` | `off` |
| `strict` | `true`, `false` | `true` |
| `multiple` | `all`, `first` | `all` |
| `skipEmpty` | `true`, `false` | `false` |
| `only` | `all`, `valid`, `invalid`, `unique`, `duplicates` | `all` |
| `numberStyle` | `plain`, `e164`, `spaced` | `plain` |
| `columns` | `full`, `numbers` | `full` |
| `numberHeader` | text, up to 60 characters | key name |
| `header` | `true`, `false` | `true` |
| `maxRows` | whole number, `0` = all | `0` |

## Limits & data lifecycle

| Rule | Value |
| --- | --- |
| Accepted types | `.csv`, `.xlsx` (legacy binary `.xls` gets a clear error: save it as `.xlsx`) |
| Max upload size | 50 MB |
| Sessions | Kept in memory only, never written to disk |
| Retention | A session ends an hour after its last use, when 8 newer ones exist, or when the server stops |
| Legacy `/api/upload` | Temporary files live in a private per-process folder (`NUMSY_WORK_DIR` overrides it) and are deleted after download |

Numsy never stores, sells or shares file contents and never uses them for AI training. See the [privacy & data disclaimer](https://numsy.pages.dev/privacy/).
