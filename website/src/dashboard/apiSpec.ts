/**
 * The REST API of `numsy dashboard`, as data: rendered by the local API reference page.
 * Keep it in step with src/controllers/dashboard.controller.ts and app.controller.ts.
 */

export type HttpMethod = 'GET' | 'POST' | 'DELETE';

export interface ApiField {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  /** How the request body is sent */
  body?: 'multipart' | 'json';
  fields?: ApiField[];
  curl: string;
  response: string;
  /** Safe to call from the page with "Try it" */
  tryable?: boolean;
}

export interface ApiGroup {
  id: string;
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

const BASE = 'http://localhost:6789';

export const apiGroups: ApiGroup[] = [
  {
    id: 'sessions',
    title: 'Sessions',
    description:
      'The dashboard flow: load a file or text into a session, page through it with any settings, then export. Sessions live in memory for an hour after their last use.',
    endpoints: [
      {
        id: 'parse',
        method: 'POST',
        path: '/api/parse',
        summary: 'Parse an upload and open a session',
        description:
          'Reads a .csv or .xlsx file (up to 50 MB) in memory, detects the phone and name columns and returns a session id. Nothing is written to disk.',
        body: 'multipart',
        fields: [{ name: 'file', type: 'file', required: true, description: '.csv or .xlsx' }],
        curl: `curl -F "file=@contacts.xlsx" ${BASE}/api/parse`,
        response: JSON.stringify(
          {
            sessionId: '8f6c2d1e-…',
            kind: 'file',
            name: 'contacts.xlsx',
            totalRows: 1200,
            columns: ['Name', 'Mobile Number', 'City'],
            detected: { phoneColumn: 'Mobile Number', nameColumn: 'Name' },
            size: 40312,
            parseMs: 41,
          },
          null,
          2,
        ),
      },
      {
        id: 'text',
        method: 'POST',
        path: '/api/text',
        summary: 'Open a session for pasted text',
        description:
          '`extract` finds every number in free text; `validate` reads one value per line.',
        body: 'json',
        fields: [
          { name: 'text', type: 'string', required: true, description: 'The text to analyse' },
          { name: 'mode', type: '"extract" | "validate"', description: 'Default: extract' },
        ],
        curl: `curl -H "Content-Type: application/json" ${BASE}/api/text \\
  -d '{"text":"Call 98765 01234 or 0 91234 56789","mode":"extract"}'`,
        response: JSON.stringify(
          { sessionId: '1b7e…', kind: 'text', name: 'Pasted text', totalRows: 1, parseMs: 0 },
          null,
          2,
        ),
      },
      {
        id: 'view',
        method: 'POST',
        path: '/api/view',
        summary: 'Read a page of results',
        description:
          'Applies the settings, then returns the summary, counts for every row set and one page of rows. Each row has a status of valid, invalid or duplicate.',
        body: 'json',
        fields: [
          { name: 'sessionId', type: 'string', required: true, description: 'From parse or text' },
          { name: 'settings', type: 'Settings', description: 'Any of the settings below' },
          { name: 'query.page', type: 'number', description: '1-based page, default 1' },
          { name: 'query.pageSize', type: 'number', description: '1 to 500, default 50' },
          {
            name: 'query.search',
            type: 'string',
            description: 'Case-insensitive match on visible cells',
          },
          { name: 'query.allColumns', type: 'boolean', description: 'Include every source column' },
        ],
        curl: `curl -H "Content-Type: application/json" ${BASE}/api/view \\
  -d '{"sessionId":"8f6c…","settings":{"dedupe":"first","only":"valid"},"query":{"page":1}}'`,
        response: JSON.stringify(
          {
            summary: { Records: 1200, Valid: 1165, Invalid: 85, Unique: 953, Duplicates: 212 },
            counts: { all: 1038, valid: 953, invalid: 85, unique: 953, duplicates: 212 },
            columns: [{ key: 'sanitizedPhone', label: 'number' }],
            rows: [{ n: 1, status: 'valid', cells: { sanitizedPhone: '7661268200' } }],
            total: 953,
            page: 1,
            pageSize: 50,
            pages: 20,
          },
          null,
          2,
        ),
      },
      {
        id: 'export',
        method: 'POST',
        path: '/api/export',
        summary: 'Download the results as a file',
        description:
          'Builds the same file `numsy process` writes with the matching flags and returns it as an attachment, with the row count in `X-Numsy-Rows`.',
        body: 'json',
        fields: [
          {
            name: 'sessionId',
            type: 'string',
            required: true,
            description: 'Or send text + mode instead',
          },
          {
            name: 'format',
            type: '"csv" | "xlsx" | "json" | "md" | "txt"',
            required: true,
            description: 'File format',
          },
          { name: 'settings', type: 'Settings', description: 'Filters and output options' },
        ],
        curl: `curl -OJ -H "Content-Type: application/json" ${BASE}/api/export \\
  -d '{"sessionId":"8f6c…","format":"xlsx","settings":{"only":"valid","numberHeader":"Mobile"}}'`,
        response:
          'Content-Disposition: attachment; filename="contacts-valid.xlsx"\nX-Numsy-Rows: 953',
      },
      {
        id: 'session',
        method: 'DELETE',
        path: '/api/session/:id',
        summary: 'Forget a session now',
        description: 'Drops the session from memory immediately. Returns 204.',
        curl: `curl -X DELETE ${BASE}/api/session/8f6c…`,
        response: 'HTTP/1.1 204 No Content',
      },
    ],
  },
  {
    id: 'one-shot',
    title: 'One-shot analysis',
    description: 'Upload a file and get the full report back in a single request.',
    endpoints: [
      {
        id: 'analyze',
        method: 'POST',
        path: '/api/analyze',
        summary: 'Analyse an upload in one call',
        description:
          'Multipart `file` plus any settings as form fields. Returns the complete analysis: rows, valid, invalid and duplicate rows, unique numbers and analytics.',
        body: 'multipart',
        fields: [
          { name: 'file', type: 'file', required: true, description: '.csv or .xlsx' },
          { name: '<setting>', type: 'string', description: 'e.g. dedupe=first, strict=false' },
        ],
        curl: `curl -F "file=@leads.csv" -F "dedupe=first" ${BASE}/api/analyze`,
        response: JSON.stringify(
          {
            durationMs: 38,
            phoneColumn: 'Mobile',
            totalRecords: 1200,
            analytics: { totalValidNumbers: 1165, uniqueValidNumbers: 953, duplicatesRemoved: 212 },
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    id: 'server',
    title: 'Server',
    description: 'Version, limits and health. These are safe to try from this page.',
    endpoints: [
      {
        id: 'meta',
        method: 'GET',
        path: '/api/meta',
        summary: 'Version, limits, formats and defaults',
        description: 'Everything a client needs to build its own interface.',
        curl: `curl ${BASE}/api/meta`,
        response: '{ "name": "numsy", "version": "…", "maxFileSize": 52428800, … }',
        tryable: true,
      },
      {
        id: 'status',
        method: 'GET',
        path: '/api/status',
        summary: 'Live server status',
        description:
          'Uptime, memory, open sessions and the Node.js runtime. Powers the Health page.',
        curl: `curl ${BASE}/api/status`,
        response: '{ "status": "OK", "uptimeSeconds": 42, "sessions": 1, … }',
        tryable: true,
      },
      {
        id: 'health',
        method: 'GET',
        path: '/api/health',
        summary: 'Liveness check',
        description: 'A minimal check for scripts and monitors.',
        curl: `curl ${BASE}/api/health`,
        response: '{ "status": "OK", "timestamp": "…" }',
        tryable: true,
      },
    ],
  },
  {
    id: 'legacy',
    title: 'Legacy 1.x',
    description: 'Kept for compatibility with Numsy 1.x clients.',
    endpoints: [
      {
        id: 'upload',
        method: 'POST',
        path: '/api/upload',
        summary: 'Process a file into a ZIP report',
        description:
          'Processes a file with default settings and returns a `downloadId`. Temporary files live in a private folder and are deleted after download.',
        body: 'multipart',
        fields: [{ name: 'file', type: 'file', required: true, description: '.csv or .xlsx' }],
        curl: `curl -F "file=@contacts.xlsx" ${BASE}/api/upload`,
        response: '{ "success": true, "downloadId": "contacts_numsy_report", "summary": { … } }',
      },
      {
        id: 'download',
        method: 'GET',
        path: '/api/download/:id',
        summary: 'Download the ZIP report',
        description: 'Valid and invalid CSVs, unique numbers and an analytics report.',
        curl: `curl -OJ ${BASE}/api/download/contacts_numsy_report`,
        response: 'Content-Type: application/zip',
      },
    ],
  },
];

export interface SettingSpec {
  field: string;
  values: string;
  defaultValue: string;
  cli: string;
}

export const settingsSpec: SettingSpec[] = [
  { field: 'phoneColumn', values: 'column name', defaultValue: 'auto-detect', cli: '--column' },
  {
    field: 'nameColumn',
    values: 'column name, "none"',
    defaultValue: 'auto-detect',
    cli: '--name-column',
  },
  {
    field: 'dedupe',
    values: '"off", "first", "last"',
    defaultValue: '"off"',
    cli: '--dedupe, --keep',
  },
  { field: 'strict', values: 'true, false', defaultValue: 'true', cli: '--loose' },
  { field: 'multiple', values: '"all", "first"', defaultValue: '"all"', cli: '--first-only' },
  { field: 'skipEmpty', values: 'true, false', defaultValue: 'false', cli: '--skip-empty' },
  {
    field: 'only',
    values: '"all", "valid", "invalid", "unique", "duplicates"',
    defaultValue: '"all"',
    cli: '--only',
  },
  {
    field: 'numberStyle',
    values: '"plain", "e164", "spaced"',
    defaultValue: '"plain"',
    cli: '--number-style',
  },
  { field: 'columns', values: '"full", "numbers"', defaultValue: '"full"', cli: '--columns' },
  {
    field: 'numberHeader',
    values: 'text, up to 60 characters',
    defaultValue: 'key name',
    cli: '--header-name',
  },
  { field: 'header', values: 'true, false', defaultValue: 'true', cli: '--no-header' },
  { field: 'maxRows', values: 'whole number, 0 = all', defaultValue: '0', cli: '--max-rows' },
];

export const errorSpec: { code: string; meaning: string }[] = [
  {
    code: '400',
    meaning: 'Bad input: unsupported file, unknown format, or a column that does not exist',
  },
  {
    code: '403',
    meaning: 'Request from another site or with a foreign Host header (DNS rebinding guard)',
  },
  { code: '404', meaning: 'Session expired or unknown. Load the file again' },
  { code: '413', meaning: 'Upload larger than 50 MB' },
];
