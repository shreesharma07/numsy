export const serveCommands = `$ numsy dashboard              # http://localhost:6789
$ numsy dashboard --open       # also opens your browser
$ numsy dashboard --port 8080  # custom port
$ npx numsy dashboard          # without installing`;

export const curlExample = `# 1. Parse a file into a session
$ curl -F "file=@contacts.xlsx" http://localhost:6789/api/parse
# → { sessionId, totalRows, columns, detected: { phoneColumn, nameColumn } }

# 2. Page through results with any settings
$ curl -H "Content-Type: application/json" http://localhost:6789/api/view \\
    -d '{"sessionId":"…","settings":{"dedupe":"first","only":"valid"},"query":{"page":1}}'

# 3. Export exactly what you see
$ curl -OJ -H "Content-Type: application/json" http://localhost:6789/api/export \\
    -d '{"sessionId":"…","format":"xlsx","settings":{"dedupe":"first","numberHeader":"Mobile"}}'`;

export const endpoints: { method: 'GET' | 'POST' | 'DELETE'; path: string; purpose: string }[] = [
  {
    method: 'GET',
    path: '/api/meta',
    purpose: 'Version, upload limit, formats and default settings.',
  },
  {
    method: 'POST',
    path: '/api/parse',
    purpose:
      'Multipart field `file` (`.csv` / `.xlsx`, ≤ 50 MB). Parsed in memory; returns a `sessionId`.',
  },
  {
    method: 'POST',
    path: '/api/text',
    purpose:
      '`{ text, mode }` with `mode` = `extract` (free text) or `validate` (one value per line).',
  },
  {
    method: 'POST',
    path: '/api/view',
    purpose:
      '`{ sessionId, settings, query }`: counts, summary and one page of rows with a status each.',
  },
  {
    method: 'POST',
    path: '/api/export',
    purpose: '`{ sessionId, format, settings }` → CSV, Excel, JSON, Markdown or text attachment.',
  },
  {
    method: 'POST',
    path: '/api/analyze',
    purpose: 'One-shot: multipart `file` + settings fields → the full analysis report.',
  },
  { method: 'DELETE', path: '/api/session/:id', purpose: 'Forget a session now.' },
  { method: 'GET', path: '/api/health', purpose: 'Liveness: `{ status: "OK", timestamp }`.' },
  {
    method: 'POST',
    path: '/api/upload',
    purpose: 'Legacy 1.x upload; returns a `downloadId` for the ZIP at `GET /api/download/:id`.',
  },
];

/** Every dashboard setting with its CLI equivalent */
export const settingsTable: { setting: string; values: string; cli: string }[] = [
  {
    setting: 'Phone / name column',
    values: 'auto-detect, a column, or no name column',
    cli: '`--column`, `--name-column`',
  },
  {
    setting: 'Duplicates',
    values: 'Keep all · Keep first · Keep last',
    cli: '`--dedupe`, `--keep`',
  },
  { setting: 'Reject dummy numbers', values: 'on · off', cli: '`--loose` turns it off' },
  { setting: 'Only the first number per cell', values: 'on · off', cli: '`--first-only`' },
  { setting: 'Skip empty phone cells', values: 'on · off', cli: '`--skip-empty`' },
  {
    setting: 'Row set (tabs)',
    values: 'All · Valid · Invalid · Unique · Duplicates',
    cli: '`--only`',
  },
  {
    setting: 'Number style',
    values: '9876501234 · +919876501234 · +91 98765 01234',
    cli: '`--number-style`',
  },
  { setting: 'Columns', values: 'All columns · Name + number', cli: '`--columns`' },
  { setting: 'Number column header', values: 'any text', cli: '`--header-name`' },
  { setting: 'Include header row', values: 'on · off', cli: '`--no-header`' },
  { setting: 'Max rows to export', values: 'a number, or all', cli: '`--max-rows`' },
  { setting: 'Export', values: 'CSV · Excel · JSON · Markdown · Text', cli: '`-f`' },
];
