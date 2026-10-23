# <img src="../../assets/icons/architecture.svg" width="28" alt="" /> Architecture

[Docs](../README.md) › Maintaining Numsy › Architecture

## Layers

```mermaid
flowchart TB
  subgraph entry["Entry points"]
    direction LR
    CLI["numsy CLI<br/><code>src/cli</code>"]
    LIB["Library consumers<br/><code>import '@numsy/numsy'</code>"]
    UI["Web UI<br/><code>public/</code>"]
  end

  subgraph core["Core · src/core"]
    direction LR
    NUMSY["Numsy facade"]
    PARSER["Parser"]
    VALIDATOR["PhoneValidator"]
    PROCESSOR["FileProcessor"]
    NUMSY --> PARSER & VALIDATOR & PROCESSOR
  end

  subgraph server["Web server · NestJS"]
    direction LR
    CTRL["AppController<br/><code>src/controllers</code>"]
    SVC["Services<br/><code>src/services</code>"]
    CTRL --> SVC
  end

  subgraph shared["Shared · src/common"]
    direction LR
    FN["Pure functions<br/>phone · export · data"]
    HELP["Helpers<br/>logger · errors · files"]
    TYPES["Interfaces & types"]
  end

  CLI --> NUMSY
  CLI -- "numsy serve" --> CTRL
  LIB --> NUMSY
  UI -- "/api/*" --> CTRL
  core --> shared
  server --> shared

  classDef entry fill:#FF4D6D,stroke:#111111,color:#111111
  classDef core fill:#FFB703,stroke:#111111,color:#111111
  classDef server fill:#8338EC,stroke:#111111,color:#FAF6EF
  classDef shared fill:#FAF6EF,stroke:#111111,color:#111111
  class CLI,LIB,UI entry
  class NUMSY,PARSER,VALIDATOR,PROCESSOR core
  class CTRL,SVC server
  class FN,HELP,TYPES shared
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

## Data flow: `numsy process file.xlsx -f json,xlsx`

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant CLI as cli/index.ts · run()
  participant N as Numsy
  participant P as Parser
  participant FP as FileProcessor
  participant V as PhoneValidator
  participant O as cli/output.ts · emit()

  User->>CLI: numsy process file.xlsx -f json,xlsx
  CLI->>N: new Numsy({ enableLogging: false, normalizeColumns: false })
  CLI->>N: analyzeFile(path, { phoneColumn })
  N->>FP: analyzeFile()
  FP->>P: parseFile() → rows
  FP->>V: detectPhoneColumn(rows)
  loop every row
    FP->>V: extractMultiple(cell)
    V-->>FP: valid + invalid numbers
  end
  FP-->>CLI: AnalysisReport (rows, valid, invalid, unique, analytics)
  CLI->>CLI: processDataset() applies --only / --country-code
  CLI->>O: emit(dataset, target)
  O-->>User: JSON on stdout or file · Excel workbook on disk
```

## Release & delivery

```mermaid
flowchart LR
  DEV["Commit<br/>(Conventional Commits)"] --> HOOKS["husky hooks<br/>Biome · commitlint · tests"]
  HOOKS --> MAIN["push to main"]
  MAIN --> CI["CI: validate · audit · build<br/>verify:package"]
  CI --> SR["semantic-release<br/>version · CHANGELOG · tag · GitHub release"]
  SR --> NPM[("npm<br/>@numsy/numsy")]
  MAIN --> CF["Cloudflare Pages build<br/>website/"]
  CF --> SITE[("numsy.pages.dev")]
```

## Design rules

- **Pure core.** `common/functions` has no I/O, so it's trivially testable.
- **Machine-readable CLI.** Data goes to stdout and status to stderr. Library logging is off inside the CLI.
- **Untrusted input.** CSV cells are formula-neutralised; terminal output is stripped of control characters.
- **Two server paths.** The NestJS services pre-date the core classes and keep their own processing. New features belong in `src/core` first.
