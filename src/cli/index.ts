#!/usr/bin/env node

/**
 * Numsy CLI
 * validate · extract · process · serve · formats
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseArgs } from 'node:util';
import { Numsy } from '../core/Numsy';
import { AppError } from '../common/helpers';
import {
  OUTPUT_FORMATS,
  OutputFormat,
  formatFromExtension,
  resolveOutputFormat,
} from '../common/functions/export.functions';
import { formatPhoneWithCountryCode } from '../common/functions/phone.functions';
import { AnalysisReport, ProcessedRow } from '../common/interfaces';
import {
  Dataset,
  OutStream,
  OutputTarget,
  Paint,
  emit,
  formatSummary,
  shouldUseColor,
  toTerminalSafe,
} from './output';

/**
 * Process exit codes
 */
export const EXIT = { OK: 0, ERROR: 1, INVALID_FOUND: 2 } as const;

type Only = 'all' | 'valid' | 'invalid' | 'unique';
const ONLY_VALUES: Only[] = ['all', 'valid', 'invalid', 'unique'];

/**
 * Injectable IO so the CLI can be driven from tests
 */
export interface CliIO {
  stdout: OutStream;
  stderr: OutStream;
  /** Returns piped stdin, or null when stdin is an interactive terminal */
  readStdin: () => Promise<string | null>;
  cwd: string;
  env: NodeJS.ProcessEnv;
}

const OPTIONS = {
  format: { type: 'string', short: 'f' },
  output: { type: 'string', short: 'o' },
  'out-dir': { type: 'string', short: 'd' },
  name: { type: 'string', short: 'n' },
  input: { type: 'string', short: 'i' },
  only: { type: 'string' },
  column: { type: 'string', short: 'c' },
  'country-code': { type: 'boolean' },
  pretty: { type: 'boolean' },
  'no-pretty': { type: 'boolean' },
  bundle: { type: 'boolean' },
  normalize: { type: 'boolean' },
  'fail-on-invalid': { type: 'boolean' },
  limit: { type: 'string' },
  quiet: { type: 'boolean', short: 'q' },
  'no-color': { type: 'boolean' },
  port: { type: 'string', short: 'p' },
  version: { type: 'boolean', short: 'v' },
  help: { type: 'boolean', short: 'h' },
} as const;

type Flags = ReturnType<typeof parse>['values'];

const parse = (argv: string[]) =>
  parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true });

/**
 * Reads the package version from package.json (works from src/ and dist/)
 */
export function readVersion(): string {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'),
    );
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

const HELP = (p: Paint) => `
${p.bold(p.coral('NUM') + p.amber('SY'))} ${p.dim('· validate, clean and export Indian phone numbers')}

${p.bold('Usage')}
  numsy <command> [options]

${p.bold('Commands')}
  validate [numbers...]   Validate numbers (args, --input file, or one-per-line on stdin)
  extract  [text...]      Pull every phone number out of free text (args, --input or stdin)
  process  <file>         Parse a CSV/XLSX file, detect the phone column, validate, de-dupe, export
  serve                   Start the web UI + REST API (alias: numsy-serve)
  formats                 List output formats

${p.bold('Output')}
  -f, --format <list>     table | json | csv | md | xlsx | txt  (comma-separated; default: table)
  -o, --output <path>     Output file; format is inferred from the extension when -f is omitted
  -d, --out-dir <dir>     Directory for generated files (default: current directory)
  -n, --name <basename>   Base filename for generated files (default: <input>-numsy / numsy-<command>)
      --only <set>        all | valid | invalid | unique  (rows to export; default: all)
      --country-code      Output valid numbers as +91XXXXXXXXXX
      --no-pretty         Compact JSON
      --limit <n>         Max rows in the terminal table (default: 50, 0 = all)

${p.bold('Input & behaviour')}
  -i, --input <file>      (validate/extract) read input from a text file
  -c, --column <name>     (process) phone column, auto-detected by default
      --bundle            (process) also write the classic ZIP report bundle
      --normalize         (process) rename known headers, e.g. "Mobile Number" -> phone
      --fail-on-invalid   Exit with code 2 if any invalid number is found (CI friendly)
  -q, --quiet             Only print the requested output
      --no-color          Disable colours (also honours NO_COLOR)
  -p, --port <n>          (serve) port, default 3000
  -v, --version           Print version
  -h, --help              Print this help

${p.bold('Examples')}
  ${p.dim('$')} numsy validate 9876501234 "+91 98765 43210"
  ${p.dim('$')} cat numbers.txt | numsy validate -f json
  ${p.dim('$')} numsy extract "Call 98765-01234 or 0 91234 56789" -f md
  ${p.dim('$')} numsy process contacts.xlsx -f json,csv,xlsx -d reports -n contacts-clean
  ${p.dim('$')} numsy process leads.csv --only unique -o unique.csv
  ${p.dim('$')} numsy process leads.csv -f xlsx --country-code --fail-on-invalid

${p.dim('Docs: https://shreesharma07.github.io/numsy/')}
`;

/**
 * Error raised for bad CLI usage (exit code 1, with a hint to --help)
 */
class UsageError extends Error {}

const parseFormats = (flags: Flags): OutputFormat[] => {
  if (flags.format) {
    const formats = flags.format.split(',').map((name) => {
      const format = resolveOutputFormat(name);
      if (!format) {
        throw new UsageError(
          `Unknown format "${name.trim()}". Use one of: ${Object.keys(OUTPUT_FORMATS).join(', ')}`,
        );
      }
      return format;
    });
    return Array.from(new Set(formats));
  }
  if (flags.output) {
    const inferred = formatFromExtension(flags.output);
    if (!inferred) {
      throw new UsageError(`Cannot infer a format from "${flags.output}". Pass --format.`);
    }
    return [inferred];
  }
  return ['table'];
};

const parseOnly = (flags: Flags): Only => {
  const only = (flags.only ?? 'all').toLowerCase() as Only;
  if (!ONLY_VALUES.includes(only)) {
    throw new UsageError(`--only must be one of: ${ONLY_VALUES.join(', ')}`);
  }
  return only;
};

const parseLimit = (flags: Flags): number => {
  if (flags.limit === undefined) return 50;
  const limit = Number(flags.limit);
  if (!Number.isInteger(limit) || limit < 0) {
    throw new UsageError('--limit must be a whole number (0 = no limit)');
  }
  return limit;
};

/**
 * Collects input from positionals, --input file or stdin
 */
const readInput = async (positionals: string[], flags: Flags, io: CliIO): Promise<string[]> => {
  if (flags.input) {
    const file = path.resolve(io.cwd, flags.input);
    if (!fs.existsSync(file)) throw new UsageError(`Input file not found: ${flags.input}`);
    return [fs.readFileSync(file, 'utf-8')];
  }
  if (positionals.length > 0 && !(positionals.length === 1 && positionals[0] === '-')) {
    return positionals;
  }
  const piped = await io.readStdin();
  if (piped === null)
    throw new UsageError('No input given. Pass values, --input <file>, or pipe stdin.');
  return [piped];
};

const toLines = (chunks: string[]) =>
  chunks
    .flatMap((chunk) => chunk.split(/\r?\n/))
    .map((line) => line.trim())
    .filter(Boolean);

const display = (phone: string, countryCode: boolean) =>
  countryCode && phone ? formatPhoneWithCountryCode(phone) : phone;

// ==================== Commands ====================

/**
 * validate: one result per input value
 */
function validateDataset(
  numsy: Numsy,
  values: string[],
  only: Only,
  countryCode: boolean,
): Dataset {
  const results = values.map((value) => numsy.validate(value));
  const valid = results.filter((r) => r.isValid);
  const unique = Array.from(new Set(valid.map((r) => r.sanitized)));

  const all = results.map((r) => ({
    input: r.original,
    sanitized: r.isValid ? display(r.sanitized, countryCode) : r.sanitized,
    valid: r.isValid,
    reason: r.reason ?? '',
  }));

  const rows =
    only === 'valid'
      ? all.filter((r) => r.valid)
      : only === 'invalid'
        ? all.filter((r) => !r.valid)
        : only === 'unique'
          ? unique.map((phone) => ({ phone: display(phone, countryCode) }))
          : all;

  return {
    title: 'Numsy · validate',
    rows,
    summary: {
      Total: results.length,
      Valid: valid.length,
      Invalid: results.length - valid.length,
      Unique: unique.length,
    },
    lines:
      only === 'invalid'
        ? all.filter((r) => !r.valid).map((r) => r.input)
        : (only === 'unique' ? unique : valid.map((r) => r.sanitized)).map((p) =>
            display(p, countryCode),
          ),
  };
}

/**
 * extract: every number found in free text
 */
function extractDataset(numsy: Numsy, text: string, only: Only, countryCode: boolean): Dataset {
  const result = numsy.extractMultiple(text);
  const all = [
    ...result.validNumbers.map((n) => ({
      number: display(n.sanitized, countryCode),
      valid: true,
      reason: '',
    })),
    ...result.invalidNumbers.map((n) => ({
      number: n.sanitized,
      valid: false,
      reason: n.reason ?? '',
    })),
  ];
  const unique = Array.from(new Set(result.validNumbers.map((n) => n.sanitized)));

  const rows =
    only === 'valid'
      ? all.filter((r) => r.valid)
      : only === 'invalid'
        ? all.filter((r) => !r.valid)
        : only === 'unique'
          ? unique.map((phone) => ({ phone: display(phone, countryCode) }))
          : all;

  return {
    title: 'Numsy · extract',
    rows,
    summary: {
      Found: result.totalFound,
      Valid: result.validCount,
      Invalid: result.invalidCount,
      Unique: unique.length,
    },
    lines:
      only === 'invalid'
        ? result.invalidNumbers.map((n) => n.sanitized)
        : (only === 'unique' ? unique : result.validNumbers.map((n) => n.sanitized)).map((p) =>
            display(p, countryCode),
          ),
  };
}

/**
 * process: analyse a CSV/XLSX file
 */
function processDataset(report: AnalysisReport, only: Only, countryCode: boolean): Dataset {
  // The library adds a `name` field to every row; drop it when the file already has its own name column
  const dropName = Boolean(report.nameColumn) && report.nameColumn !== 'name';

  const fmt = (source: ProcessedRow): ProcessedRow => {
    const row = { ...source };
    if (dropName) delete row.name;
    if (countryCode && row.validationStatus === 'VALID') {
      row[report.phoneColumn] = display(row.sanitizedPhone ?? '', true);
      row.sanitizedPhone = display(row.sanitizedPhone ?? '', true);
    }
    return row;
  };

  const all = report.rows.map(fmt);
  const valid = report.validRows.map(fmt);
  const invalid = report.invalidRows.map(fmt);
  const unique = report.unique.map((u) => ({
    ...(report.nameColumn ? { name: u.name ?? '' } : {}),
    phone: display(u.phone, countryCode),
    occurrences: u.occurrences,
  }));

  const rows = { all, valid, invalid, unique }[only];
  const tableColumns =
    only === 'unique'
      ? Object.keys(unique[0] ?? { phone: '' })
      : [
          ...(report.nameColumn ? [report.nameColumn] : []),
          'originalPhone',
          'sanitizedPhone',
          'validationStatus',
          'validationReason',
        ];

  const { analytics } = report;
  const sheets = {
    all: [
      { name: 'All rows', rows: all },
      { name: 'Valid', rows: valid },
      { name: 'Invalid', rows: invalid },
      { name: 'Unique', rows: unique },
    ],
    valid: [{ name: 'Valid', rows: valid }],
    invalid: [{ name: 'Invalid', rows: invalid }],
    unique: [{ name: 'Unique', rows: unique }],
  }[only];

  return {
    title: `Numsy · ${path.basename(report.source ?? 'data')}`,
    rows,
    tableColumns,
    summary: {
      Records: report.totalRecords,
      Valid: analytics.totalValidNumbers,
      Invalid: analytics.totalInvalidNumbers,
      Unique: analytics.uniqueValidNumbers,
      Duplicates: analytics.duplicateNumbers,
      'Phone column': report.phoneColumn,
    },
    lines:
      only === 'invalid'
        ? invalid.map((r) => r.originalPhone ?? '')
        : only === 'unique'
          ? unique.map((u) => u.phone)
          : valid.map((r) => r.sanitizedPhone ?? ''),
    sheets,
    json: {
      source: report.source,
      phoneColumn: report.phoneColumn,
      nameColumn: report.nameColumn ?? null,
      analytics,
      ...(only === 'all' ? { unique } : {}),
    },
  };
}

/**
 * Runs the CLI and resolves with the exit code
 */
export async function run(argv: string[], io: CliIO): Promise<number> {
  let paint = new Paint(shouldUseColor(io.stderr, io.env));

  try {
    const { values: flags, positionals } = parse(argv);
    paint = new Paint(shouldUseColor(io.stderr, io.env, flags['no-color'] ? false : undefined));
    const outPaint = new Paint(
      shouldUseColor(io.stdout, io.env, flags['no-color'] ? false : undefined),
    );
    const [command, ...args] = positionals;

    if (flags.version) {
      io.stdout.write(`${readVersion()}\n`);
      return EXIT.OK;
    }
    if (flags.help || !command || command === 'help') {
      io.stdout.write(HELP(outPaint));
      return command || flags.help ? EXIT.OK : EXIT.ERROR;
    }

    if (command === 'formats') {
      for (const [name, meta] of Object.entries(OUTPUT_FORMATS)) {
        io.stdout.write(
          `${outPaint.bold(name.padEnd(6))} ${meta.extension.padEnd(6)} ${meta.description}\n`,
        );
      }
      return EXIT.OK;
    }

    if (command === 'serve') {
      const { startServer, parsePort } = await import('./server');
      const port = flags.port === undefined ? undefined : parsePort(flags.port);
      if (flags.port !== undefined && !port)
        throw new UsageError('--port must be between 1024 and 65535');
      await startServer({ port });
      return EXIT.OK;
    }

    if (!['validate', 'extract', 'process'].includes(command)) {
      throw new UsageError(`Unknown command "${command}".`);
    }

    const formats = parseFormats(flags);
    const only = parseOnly(flags);
    const countryCode = Boolean(flags['country-code']);
    const numsy = new Numsy({ enableLogging: false, normalizeColumns: Boolean(flags.normalize) });
    const outDir = flags['out-dir'];

    let dataset: Dataset;
    let defaultName = `numsy-${command}`;

    if (command === 'process') {
      const [file] = args;
      if (!file) throw new UsageError('process needs a file: numsy process <file.csv|file.xlsx>');
      const filePath = path.resolve(io.cwd, file);
      if (!fs.existsSync(filePath)) throw new UsageError(`File not found: ${file}`);

      const report = await numsy.analyzeFile(filePath, { phoneColumn: flags.column });
      report.source = file;
      dataset = processDataset(report, only, countryCode);
      defaultName = `${path.basename(file, path.extname(file))}-numsy`;

      if (flags.bundle) {
        const result = await numsy.processFile(filePath, path.resolve(io.cwd, outDir ?? '.'));
        if (!flags.quiet) io.stderr.write(`${paint.ok('✔')} bundle  ${result.zipFilePath}\n`);
      }
    } else {
      const input = await readInput(args, flags, io);
      dataset =
        command === 'validate'
          ? validateDataset(
              numsy,
              flags.input || args.length === 0 ? toLines(input) : input,
              only,
              countryCode,
            )
          : extractDataset(numsy, input.join('\n'), only, countryCode);
    }

    const target: OutputTarget = {
      formats,
      output: flags.output,
      outDir,
      name: flags.name,
      defaultName,
      pretty: !flags['no-pretty'],
      limit: parseLimit(flags),
      cwd: io.cwd,
    };

    const written = await emit(dataset, target, io.stdout, outPaint);

    if (!flags.quiet && written.length > 0) {
      for (const file of written) {
        const size = fs.statSync(file).size;
        io.stderr.write(
          `${paint.ok('✔')} ${path.relative(io.cwd, file) || file} ${paint.dim(`(${size} B)`)}\n`,
        );
      }
      if (!formats.includes('table'))
        io.stderr.write(`  ${formatSummary(dataset.summary, paint)}\n`);
    }

    const invalid = Number(dataset.summary.Invalid ?? 0);
    return flags['fail-on-invalid'] && invalid > 0 ? EXIT.INVALID_FOUND : EXIT.OK;
  } catch (error) {
    const err = error as Error & { code?: string };
    const message =
      error instanceof UsageError || err.code?.startsWith?.('ERR_PARSE_ARGS')
        ? `${err.message}\nRun "numsy --help" for usage.`
        : error instanceof AppError
          ? err.message
          : `Unexpected error: ${err.message}`;
    // Messages can echo file contents (e.g. column names), so strip control characters per line
    const safe = message.split('\n').map(toTerminalSafe).join('\n');
    io.stderr.write(`${paint.bad('✖')} ${safe}\n`);
    return EXIT.ERROR;
  }
}

/**
 * Reads all of stdin when it is piped
 */
const readProcessStdin = (): Promise<string | null> => {
  if (process.stdin.isTTY) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
};

if (require.main === module) {
  run(process.argv.slice(2), {
    stdout: process.stdout,
    stderr: process.stderr,
    readStdin: readProcessStdin,
    cwd: process.cwd(),
    env: process.env,
  }).then((code) => {
    // `serve` keeps the event loop alive, so this only takes effect once the server stops
    process.exitCode = code;
  });
}
