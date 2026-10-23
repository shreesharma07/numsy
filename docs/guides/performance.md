# <img src="../../assets/icons/quickstart.svg" width="28" alt="" /> Performance

[Docs](../README.md) › Using Numsy › Performance

Numsy validates about **1.1 million numbers per second** on a laptop: **100,000 numbers in under 0.1 s**, and a full analysis of a 500,000-row spreadsheet (validation, de-duplication and export) in a few seconds.

## Synthetic benchmark

Generated data in the formats real lists contain: `+91` and `0` prefixes, spaces and dashes, about 15% repeats, 5% invalid or dummy numbers and 5% cells holding two numbers.

| Numbers | Validate | Parse CSV | Analyse | Analyse + de-dupe | Export CSV |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 100,000 | 89 ms (1.12 M/s) | 83 ms (2.7 MB) | 320 ms | 289 ms | 274 ms |
| 500,000 | 424 ms (1.18 M/s) | 449 ms (14.1 MB) | 1.40 s | 1.79 s | 1.65 s |
| 1,000,000 | 815 ms (1.23 M/s) | 1.39 s (28.4 MB) | 2.58 s | 2.49 s | 4.59 s |

Measured with Numsy 2.1 on an AMD Ryzen 7 5800HS laptop (16 threads, Node.js 24, Windows 11).

- **Validate** runs every rule, including the dummy-pattern checks, on each value.
- **Analyse** detects the columns, extracts every number from every cell, validates them, tracks repeats and builds the valid, invalid, unique and duplicate sets.
- **Export CSV** formats and serialises the valid rows.

Reproduce it on your own machine:

```bash
pnpm build
node scripts/benchmark.js            # 100k, 500k and 1M numbers
node scripts/benchmark.js 250000     # any size
node scripts/benchmark.js --md       # this table
```

## Real-world workbooks

Numsy 2.1 was also run against nine real contact workbooks: anonymised business lists from 17 rows to half a million. The data never left the test machine, and only these aggregate figures are published.

| Workbook | Rows | Valid | Invalid | Unique | Read | Analyse | De-dupe |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Large export, 11.7 MB | 505,277 | 504,407 | 870 | 273,123 | 8.7 s | 2.2 s | 2.3 s |
| Medium list, 0.4 MB | 15,578 | 15,551 | 27 | 9,801 | 265 ms | 92 ms | 63 ms |
| Event sign-ups, 0.1 MB | 4,188 | 4,185 | 3 | 4,092 | 75 ms | 26 ms | 24 ms |
| Five small lists | 17–386 | 17–407 | 0–9 | 16–404 | ≤ 90 ms | ≤ 6 ms | ≤ 2 ms |
| Truncated file, 6.4 MB | — | — | — | — | clear error | — | — |

- **Read** is dominated by unzipping and parsing the `.xlsx`; CSV is about 20× faster to read.
- In the dashboards, the 505,277-row workbook goes from upload to results in about 16–18 s, in both the local dashboard and the website playground, and the "Keep first" filter re-runs in 3–5 s.
- Every figure the dashboards showed matched the library's own analysis exactly (`e2e/real-files.spec.ts`).

## Where the time goes

| Surface | Parsing | Analysis | Notes |
| --- | --- | --- | --- |
| CLI and library | Node.js | Node.js | Fastest path; streams nothing to a browser |
| Local dashboard | Node.js server | Node.js server | The browser only receives the visible page of rows |
| Website playground | Web Worker | Web Worker | Same engine in the visitor's browser; the page stays responsive |

Changing the number style, row set, search or page reuses the cached analysis. Changing a filter (columns, duplicates, rules) re-runs it.
