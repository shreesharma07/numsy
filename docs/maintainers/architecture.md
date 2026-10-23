# <img src="../../assets/icons/architecture.svg" width="28" alt="" /> Architecture

[Docs](../README.md) › Maintaining Numsy › Architecture

## Layers

```mermaid
flowchart TB
  subgraph entry["Entry points"]
    direction LR
    CLI["numsy CLI<br/><code>src/cli</code>"]
    LIB["Library consumers<br/><code>import 'numsy'</code>"]
    UI["Local dashboard<br/><code>dist/dashboard</code>"]
    WEB["Website playground<br/><code>website/</code>"]
  end

  subgraph core["Core · src/core"]
    direction LR
    NUMSY["Numsy facade"]
    PARSER["Parser"]
    VALIDATOR["PhoneValidator"]
    PROCESSOR["FileProcessor"]
    NUMSY --> PARSER & VALIDATOR & PROCESSOR
  end

  subgraph server["Local server · NestJS"]
    direction LR
    CTRL["DashboardController<br/>AppController (legacy)"]
    SVC["DashboardSessions<br/>legacy services"]
    CTRL --> SVC
  end

  subgraph engine["Engine · src/engine (no Node.js imports)"]
    direction LR
    ANALYZE["analyzeRows · columns · rules"]
    DATA["datasets · shaping · serialisers"]
    SESSION["AnalysisSession · Settings"]
  end

  subgraph shared["Shared · src/common"]
    direction LR
    FN["Pure functions<br/>phone · export · data"]
    HELP["Helpers<br/>logger · errors · files"]
    TYPES["Interfaces & types"]
  end

  CLI --> NUMSY
  CLI --> engine
  CLI -- "numsy dashboard" --> CTRL
  LIB --> NUMSY
  UI -- "/api/*" --> CTRL
  WEB -- "Web Worker" --> engine
  core --> engine
  server --> engine
  engine --> shared

  classDef entry fill:#FF4D6D,stroke:#111111,color:#111111
  classDef core fill:#FFB703,stroke:#111111,color:#111111
  classDef server fill:#8338EC,stroke:#111111,color:#FAF6EF
  classDef shared fill:#FAF6EF,stroke:#111111,color:#111111
  classDef engine fill:#FFFDF9,stroke:#8338EC,stroke-width:3px,color:#111111
  class CLI,LIB,UI,WEB entry
  class ANALYZE,DATA,SESSION engine
  class NUMSY,PARSER,VALIDATOR,PROCESSOR core
  class CTRL,SVC server
  class FN,HELP,TYPES shared
```

## Modules

| Path | Responsibility |
| --- | --- |
| `src/index.ts` | Public package surface: core classes, interfaces, functions, helpers |
| `src/core/Numsy.ts` | Facade; owns one `Parser`, `PhoneValidator`, `FileProcessor` and passes options down |
| `src/core/Parser.ts` | `parseFile()` / `parseBuffer()`: CSV via `parseCsv()`, XLSX via `exceljs` + `worksheetToRows()`, header normalisation, CSV writing |
| `src/core/PhoneValidator.ts` | Validation, extraction, phone-column detection |
| `src/core/FileProcessor.ts` | `analyze()` → `analyzeRows()`; `processFile()` → ZIP bundle |
| `src/engine/` | Browser-safe core (`numsy/engine`): rules, column detection, `analyzeRows()`, datasets, `shapeDataset()`, serialisers, `Settings`, `AnalysisSession` |
| `src/common/functions/phone.functions.ts` | Sanitising, candidate finding, final regex validation |
| `src/common/functions/export.functions.ts` | Re-exports the engine serialisers; Node-only `writeXlsx()` / `toXlsxBuffer()` |
| `src/cli/index.ts` | Argument parsing (`util.parseArgs`), commands, exit codes |
| `src/cli/output.ts` | Terminal table, colours, routing formats to stdout or files |
| `src/cli/server.ts` | `startServer()` for `numsy dashboard`: port 6789, `127.0.0.1`, host guard, `--open` |
| `src/controllers/dashboard.controller.ts` | `/api/meta`, `parse`, `text`, `view`, `export`, `analyze`, `session/:id` |
| `src/services/dashboard-sessions.service.ts` | In-memory sessions (1 h idle TTL, 8 most recent) |
| `src/controllers/app.controller.ts`, other services | Legacy `/api/upload` ZIP flow and health endpoints |
| `website/src/dashboard/` | The dashboard UI: `createLocalRuntime()` (server) or `createBrowserRuntime()` (Web Worker) |
| `website/local/` | Entry built into `dist/dashboard` by `vite.dashboard.config.ts` |

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
  CLI->>CLI: reportDataset() applies --only / --number-style, shapeDataset() the output flags
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
  SR --> NPM[("npm<br/>numsy")]
  MAIN --> CF["Cloudflare Pages build<br/>website/"]
  CF --> SITE[("numsy.pages.dev")]
```

## Design rules

- **Pure core.** `common/functions` has no I/O, so it's trivially testable.
- **Machine-readable CLI.** Data goes to stdout and status to stderr. Library logging is off inside the CLI.
- **Untrusted input.** CSV cells are formula-neutralised; terminal output is stripped of control characters.
- **One engine.** The CLI, the library, the local dashboard and the website playground all call `src/engine`, so they agree to the row. New behaviour belongs there first, with a test in `test/engine.spec.ts` and, for the UI, `e2e/`.
- **Browser-safe engine.** `src/engine` and the pure modules it imports must not import Node.js modules; the website type-checks and bundles them.
- **Legacy server path.** The NestJS services behind `/api/upload` pre-date the engine and keep their own processing for 1.x compatibility.
