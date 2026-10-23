# <img src="../../assets/icons/architecture.svg" width="28" alt="" /> Architecture

[Docs](../README.md) › Maintaining Numsy › Architecture

## Layers

```text
            ┌──────────────┐   ┌──────────────────────┐   ┌──────────────────────────┐
 entry      │  CLI          │   │  Library consumers    │   │  Web UI (public/)         │
 points     │  src/cli      │   │  import '@numsy/numsy'│   │  → REST (src/controllers) │
            └──────┬───────┘   └──────────┬───────────┘   └────────────┬─────────────┘
                   │                      │                            │
 core              ▼                      ▼                            ▼
            ┌─────────────────────────────────────────┐   ┌──────────────────────────┐
            │  Numsy facade (src/core)                 │   │  NestJS services          │
            │  Parser · PhoneValidator · FileProcessor │   │  (src/services)           │
            └──────────────────┬──────────────────────┘   └────────────┬─────────────┘
                               ▼                                       ▼
 shared     ┌──────────────────────────────────────────────────────────────────────┐
            │  src/common: pure functions (phone, export, data) · helpers · types   │
            └──────────────────────────────────────────────────────────────────────┘
```

## Modules

| Path | Responsibility |
| --- | --- |
| `src/index.ts` | Public package surface: core classes, interfaces, functions, helpers |
| `src/core/Numsy.ts` | Facade; owns one `Parser`, `PhoneValidator`, `FileProcessor` and passes options down |
| `src/core/Parser.ts` | CSV/XLSX reading (`csv-parser`, `exceljs`), header normalisation, CSV writing |
| `src/core/PhoneValidator.ts` | Validation, extraction, phone-column detection |
| `src/core/FileProcessor.ts` | `analyze()` → `AnalysisReport` in memory; `processFile()` → ZIP bundle |
| `src/common/functions/phone.functions.ts` | Sanitising, candidate finding, final regex validation |
| `src/common/functions/export.functions.ts` | JSON / CSV / Markdown / text / Excel serialisers |
| `src/cli/index.ts` | Argument parsing (`util.parseArgs`), commands, exit codes |
| `src/cli/output.ts` | Terminal table, colours, routing formats to stdout or files |
| `src/cli/server.ts` | `startServer()` for `numsy serve` / `numsy-serve` |
| `src/controllers`, `src/services` | NestJS web server used by the UI |

## Data flow: `numsy process file.xlsx -f json`

1. `run()` parses flags and creates `new Numsy({ enableLogging: false, normalizeColumns: false })`
2. `analyzeFile()` → `Parser.parseFile()` → rows
3. `FileProcessor.analyze()` detects phone/name columns, extracts every number per cell, validates and de-dupes
4. `processDataset()` shapes the report for `--only` / `--country-code`
5. `emit()` serialises each format and sends it to stdout or a file

## Design rules

- **Pure core.** `common/functions` has no I/O, so it's trivially testable.
- **Machine-readable CLI.** Data goes to stdout and status to stderr. Library logging is off inside the CLI.
- **Untrusted input.** CSV cells are formula-neutralised; terminal output is stripped of control characters.
- **Two server paths.** The NestJS services pre-date the core classes and keep their own processing. New features belong in `src/core` first.
