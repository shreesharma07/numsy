# <img src="../../assets/icons/library.svg" width="28" alt="" /> Library

[Docs](../README.md) › Using Numsy › Library

```bash
npm install @numsy/numsy
```

```ts
import { Numsy } from '@numsy/numsy';

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
| `analyzeFile(path, options?)` | `AnalysisReport`, in memory, nothing written |
| `analyze(rows, options?)` | `AnalysisReport` for already-parsed rows |
| `processFile(path, outputDir?)` | Writes CSVs + `analytics.txt` + ZIP, returns their paths |
| `writeCsv(rows, path)` | Writes rows to CSV |
| `detectPhoneColumn(rows)` | Column name or `null` |

`AnalyzeOptions`: `{ phoneColumn?: string; nameColumn?: string | null }`

```ts
const report = await numsy.analyzeFile('contacts.xlsx');

report.validRows;   // rows with a valid number (one row per number when a cell holds several)
report.invalidRows; // rows with validationReason
report.unique;      // [{ phone, name?, occurrences }]
report.analytics;   // { totalValidNumbers, uniqueValidNumbers, duplicateNumbers, … }
```

## Exporters

```ts
import { toJSON, toCSV, toMarkdown, toText, writeXlsx } from '@numsy/numsy';

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

## Lower-level building blocks

`Parser`, `PhoneValidator` and `FileProcessor` are exported for custom pipelines. So are the pure helpers in `common/functions`, such as `sanitizePhoneNumber`, `findPhoneCandidates` and `extractAndValidatePhoneNumbers`.
