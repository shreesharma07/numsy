# <img src="../../assets/icons/library.svg" width="28" alt="" /> Library

[Docs](../README.md) › Using Numsy › Library

```bash
npm install numsy
```

```ts
import { Numsy } from 'numsy';

const numsy = new Numsy({ enableLogging: false });
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `enableLogging` | `true` | Set `false` to silence every component |
| `logLevel` | `'log'` | `log` · `error` · `warn` · `debug` · `verbose` |
| `throwOnError` | `false` | Throw instead of returning fallback results |
| `normalizeColumns` | `true` | Rename known headers (`Mobile Number` → `phone`) when parsing files |

## Numbers

| Method | Returns |
| --- | --- |
| `validate(phone)` | `{ original, sanitized, isValid, reason? }` |
| `validateBatch(phones)` | `PhoneValidationResult[]` |
| `isValid(phone)` | `boolean` |
| `sanitize(phone)` | Digits only, `+91`/`0` prefix removed |
| `format(phone, withCountryCode?)` | `9876501234` or `+919876501234` |
| `extractMultiple(text)` | `{ extractedNumbers, validNumbers, invalidNumbers, validCount, … }` |

```ts
numsy.validate('+91 98765 01234');
// { original: '+91 98765 01234', sanitized: '9876501234', isValid: true }

numsy.extractMultiple('Call 98765-01234 or 0 91234 56789').validNumbers.map((n) => n.sanitized);
// ['9876501234', '9123456789']
```

### Validation rules

A number is valid when, after sanitizing:

- it is exactly **10 digits** (a leading `91` on 12 digits or `0` on 11 digits is stripped first)
- it starts with **6, 7, 8 or 9**
- it is **not** all the same digit, the same digit nine times after the prefix, a straight sequence, or a known dummy (`9999900000`, …)

## Files

| Method | Returns |
| --- | --- |
| `parseFile(path)` | `{ data, totalRows, detectedColumns }` |
| `parseBuffer(buffer, fileName)` | Same, from bytes already in memory (an upload, a fetch response) |
| `analyzeFile(path, options?)` | `AnalysisReport`, in memory, nothing written |
| `analyze(rows, options?)` | `AnalysisReport` for already-parsed rows |
| `processFile(path, outputDir?, options?)` | Writes CSVs + `analytics.txt` + ZIP, returns their paths |
| `writeCsv(rows, path)` | Writes rows to CSV |
| `detectPhoneColumn(rows)` | Column name or `null` |

### Analysis options

| Option | Default | Description |
| --- | --- | --- |
| `phoneColumn` | auto-detect | Column holding the numbers |
| `nameColumn` | auto-detect | Column holding contact names; `null` disables it |
| `dedupe` | `'off'` | `'first'` or `'last'` removes repeat occurrences from `rows` and `validRows` |
| `strict` | `true` | `false` accepts dummy patterns such as `9999999999` |
| `multiple` | `'all'` | `'first'` keeps only the first valid number of each cell |
| `skipEmpty` | `false` | Leave empty phone cells out of `invalidRows` |

```ts
const report = await numsy.analyzeFile('contacts.xlsx');

report.validRows;     // rows with a valid number (one row per number when a cell holds several)
report.invalidRows;   // rows with validationReason
report.duplicateRows; // repeat occurrences (removed from validRows when dedupe is on)
report.unique;        // [{ phone, name?, occurrences }]
report.analytics;     // { totalValidNumbers, uniqueValidNumbers, duplicateNumbers, … }
```

## Exporters

```ts
import { toJSON, toCSV, toMarkdown, toText, writeXlsx } from 'numsy';

toCSV(report.validRows);
toMarkdown(report.unique, { title: 'Unique numbers', summary: { Total: report.unique.length } });
await writeXlsx([{ name: 'Valid', rows: report.validRows }], 'valid.xlsx');
```

| Function | Output |
| --- | --- |
| `toJSON(data, { pretty })` | JSON string |
| `toCSV(rows, { columns, delimiter })` | RFC 4180 CSV, formula-safe |
| `toMarkdown(rows, { title, summary })` | Markdown document |
| `toText(values)` | Newline-separated text |
| `toXlsxBuffer(sheets)` / `writeXlsx(sheets, path)` | Excel workbook |
| `resolveOutputFormat(name)` / `formatFromExtension(path)` | `OutputFormat \| null` |

## Browser-safe engine: `numsy/engine`

The engine behind the CLI, the local dashboard and the website playground has no Node.js imports, so it also runs in browsers, Web Workers and edge runtimes.

```ts
import { analyzeRows, parseCsv, reportDataset, serializeDataset, shapeDataset } from 'numsy/engine';

const { data } = parseCsv(await file.text()); // BOM, quotes and , ; tab | delimiters
const report = analyzeRows(data, { dedupe: 'first' });
const csv = serializeDataset(
  shapeDataset(reportDataset(report, { only: 'valid', numberStyle: 'e164' }), {
    columns: 'numbers',
    numberHeader: 'Mobile',
  }),
  'csv',
);
```

| Export | Purpose |
| --- | --- |
| `checkNumber()` / `extractNumbers()` / `formatNumber()` | Validate, find and style single numbers |
| `parseCsv()` / `worksheetToRows()` | Read CSV text or an ExcelJS worksheet |
| `analyzeRows()` | The analysis behind `analyzeFile()` |
| `validateDataset()` / `extractDataset()` / `reportDataset()` | Row sets ready for export |
| `shapeDataset()` | Header name, name + number columns, row cap |
| `serializeDataset()` / `datasetSheets()` / `buildWorkbook()` | JSON, CSV, Markdown, text and Excel output |
| `Settings`, `resolveSettings()`, `AnalysisSession` | The dashboard's settings model and paged views |

## Lower-level building blocks

`Parser`, `PhoneValidator` and `FileProcessor` are exported for custom pipelines. So are the pure helpers in `common/functions`, such as `sanitizePhoneNumber`, `findPhoneCandidates` and `extractAndValidatePhoneNumbers`.
