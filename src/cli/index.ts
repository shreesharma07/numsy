#!/usr/bin/env node

/**
 * Numsy CLI
 * validate · extract · process · dashboard · formats
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
import { DedupeMode } from '../common/interfaces';
import { PORT_CONSTANTS } from '../common/types/enums';
import {
  Dataset,
  OutputOptions,
  ROW_SETS,
  RowSet,
  extractDataset,
  reportDataset,
  validateDataset,
} from '../engine/dataset';
import { NUMBER_STYLES, NumberStyle } from '../engine/rules';
import {
  OutStream,
  OutputTarget,
  Paint,
  emit,
  formatSummary,
  shouldUseColor,
  toTerminalSafe,
} from './output';
import { readVersion } from './version';

/**
 * Process exit codes
 */
export const EXIT = { OK: 0, ERROR: 1, INVALID_FOUND: 2 } as const;

/** Commands that start the local dashboard */
const DEFAULT_PORT = PORT_CONSTANTS.DEFAULT;
const DASHBOARD_COMMANDS = ['dashboard', 'serve', 'ui'];

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
  'number-style': { type: 'string' },
  dedupe: { type: 'boolean' },
  keep: { type: 'string' },
  loose: { type: 'boolean' },
  'first-only': { type: 'boolean' },
  'skip-empty': { type: 'boolean' },
  'name-column': { type: 'string' },
  'no-header': { type: 'boolean' },
  'header-name': { type: 'string' },
  'max-rows': { type: 'string' },
  columns: { type: 'string' },
  pretty: { type: 'boolean' },
  'no-pretty': { type: 'boolean' },
  bundle: { type: 'boolean' },
  normalize: { type: 'boolean' },
  'fail-on-invalid': { type: 'boolean' },
  limit: { type: 'string' },
  quiet: { type: 'boolean', short: 'q' },
  'no-color': { type: 'boolean' },
  port: { type: 'string', short: 'p' },
  host: { type: 'string' },
  open: { type: 'boolean' },
  version: { type: 'boolean', short: 'v' },
  help: { type: 'boolean', short: 'h' },
} as const;

type Flags = ReturnType<typeof parse>['values'];

const parse = (argv: string[]) =>
  parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true });

export { readVersion } from './version';

const HELP = (p: Paint) => `
${p.bold(p.coral('NUM') + p.amber('SY'))} ${p.dim('· validate, clean and export Indian phone numbers')}

${p.bold('Usage')}
  numsy <command> [options]

${p.bold('Commands')}
  validate [numbers...]   Validate numbers (args, --input file, or one-per-line on stdin)
  extract  [text...]      Pull every phone number out of free text (args, --input or stdin)
  process  <file>         Parse a CSV/XLSX file, detect the phone column, validate, de-dupe, export
  dashboard               Open the local dashboard + REST API on http://localhost:${DEFAULT_PORT}
                          (aliases: serve, ui)
  formats                 List output formats

${p.bold('Output')}
  -f, --format <list>     table | json | csv | md | xlsx | txt  (comma-separated; default: table)
  -o, --output <path>     Output file; format is inferred from the extension when -f is omitted
  -d, --out-dir <dir>     Directory for generated files (default: current directory)
  -n, --name <basename>   Base filename for generated files (default: <input>-numsy / numsy-<command>)
      --only <set>        all | valid | invalid | unique | duplicates  (rows to export; default: all)
      --number-style <s>  plain | e164 | spaced  (9876501234 | +919876501234 | +91 98765 01234)
      --country-code      Shorthand for --number-style e164
      --columns <c>       full | numbers  (every column, or only name + number; default: full)
      --header-name <h>   Rename the number column in exports, e.g. "Mobile"
      --no-header         Leave the header row out of CSV and Excel output
      --max-rows <n>      Export at most n rows (default: 0 = all)
      --no-pretty         Compact JSON
      --limit <n>         Max rows in the terminal table (default: 50, 0 = all)

${p.bold('Filters')}
      --dedupe            Drop repeat occurrences of a number, keeping the first
      --keep <first|last> Drop repeats, keeping the first or the last occurrence
      --loose             Accept dummy patterns such as 9999999999 (shape check only)
      --first-only        (process) keep only the first valid number of each cell
      --skip-empty        (process) leave rows with an empty phone cell out of the invalid set

${p.bold('Input & behaviour')}
  -i, --input <file>      (validate/extract) read input from a text file
  -c, --column <name>     (process) phone column, auto-detected by default
      --name-column <c>   (process) contact-name column, auto-detected; "none" to disable
      --bundle            (process) also write the classic ZIP report bundle
      --normalize         (process) rename known headers, e.g. "Mobile Number" -> phone
      --fail-on-invalid   Exit with code 2 if any invalid number is found (CI friendly)
  -q, --quiet             Only print the requested output
      --no-color          Disable colours (also honours NO_COLOR)
  -v, --version           Print version
  -h, --help              Print this help

${p.bold('Dashboard')}
  -p, --port <n>          Port (default: ${DEFAULT_PORT}; the next free port is used when busy)
      --host <addr>       Interface to listen on (default: 127.0.0.1, this machine only)
      --open              Open the dashboard in your browser

${p.bold('Examples')}
  ${p.dim('$')} numsy validate 9876501234 "+91 98765 43210"
  ${p.dim('$')} cat numbers.txt | numsy validate -f json --dedupe
  ${p.dim('$')} numsy extract "Call 98765-01234 or 0 91234 56789" -f md
  ${p.dim('$')} numsy process contacts.xlsx -f json,csv,xlsx -d reports -n contacts-clean
  ${p.dim('$')} numsy process leads.csv --dedupe --only valid -o clean.csv
  ${p.dim('$')} numsy process leads.csv -f xlsx --number-style spaced --fail-on-invalid
  ${p.dim('$')} numsy dashboard --open

${p.dim('Docs: https://numsy.pages.dev/')}
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

const parseOnly = (flags: Flags): RowSet => {
  const only = (flags.only ?? 'all').toLowerCase() as RowSet;
  if (!ROW_SETS.includes(only)) {
    throw new UsageError(`--only must be one of: ${ROW_SETS.join(', ')}`);
  }
  return only;
};

const parseNumberStyle = (flags: Flags): NumberStyle => {
  if (flags['number-style'] === undefined) return flags['country-code'] ? 'e164' : 'plain';
  const style = flags['number-style'].toLowerCase() as NumberStyle;
  if (!NUMBER_STYLES.includes(style)) {
    throw new UsageError(`--number-style must be one of: ${NUMBER_STYLES.join(', ')}`);
  }
  return style;
};

const parseDedupe = (flags: Flags): DedupeMode => {
  if (flags.keep === undefined) return flags.dedupe ? 'first' : 'off';
  const keep = flags.keep.toLowerCase();
  if (keep !== 'first' && keep !== 'last') throw new UsageError('--keep must be first or last');
  return keep;
};

const parseShape = (flags: Flags): OutputOptions => {
  const maxRows = flags['max-rows'] === undefined ? 0 : Number(flags['max-rows']);
  if (!Number.isInteger(maxRows) || maxRows < 0) {
    throw new UsageError('--max-rows must be a whole number (0 = all)');
  }
  const columns = (flags.columns ?? 'full').toLowerCase();
  if (columns !== 'full' && columns !== 'numbers') {
    throw new UsageError('--columns must be full or numbers');
  }
  return {
    header: !flags['no-header'],
    numberHeader: flags['header-name'],
    maxRows,
    columns,
  };
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

    if (DASHBOARD_COMMANDS.includes(command)) {
      const { startServer, parsePort } = await import('./server');
      const port = flags.port === undefined ? undefined : parsePort(flags.port);
      if (flags.port !== undefined && !port)
        throw new UsageError('--port must be between 1024 and 65535');
      await startServer({ port, host: flags.host, open: Boolean(flags.open) });
      return EXIT.OK;
    }

    if (!['validate', 'extract', 'process'].includes(command)) {
      throw new UsageError(`Unknown command "${command}".`);
    }

    const formats = parseFormats(flags);
    const shape = parseShape(flags);
    const dedupe = parseDedupe(flags);
    const view = {
      only: parseOnly(flags),
      numberStyle: parseNumberStyle(flags),
      strict: !flags.loose,
      dedupe: dedupe !== 'off',
    };
    const numsy = new Numsy({ enableLogging: false, normalizeColumns: Boolean(flags.normalize) });
    const outDir = flags['out-dir'];

    let dataset: Dataset;
    let defaultName = `numsy-${command}`;

    if (command === 'process') {
      const [file] = args;
      if (!file) throw new UsageError('process needs a file: numsy process <file.csv|file.xlsx>');
      const filePath = path.resolve(io.cwd, file);
      if (!fs.existsSync(filePath)) throw new UsageError(`File not found: ${file}`);

      const nameColumn = flags['name-column'];
      const analyzeOptions = {
        phoneColumn: flags.column,
        nameColumn:
          nameColumn === undefined ? undefined : nameColumn === 'none' ? null : nameColumn,
        dedupe,
        strict: view.strict,
        multiple: flags['first-only'] ? ('first' as const) : ('all' as const),
        skipEmpty: Boolean(flags['skip-empty']),
      };
      const report = await numsy.analyzeFile(filePath, analyzeOptions);
      report.source = file;
      dataset = reportDataset(report, view);
      defaultName = `${path.basename(file, path.extname(file))}-numsy`;

      if (flags.bundle) {
        const result = await numsy.processFile(
          filePath,
          path.resolve(io.cwd, outDir ?? '.'),
          analyzeOptions,
        );
        if (!flags.quiet) io.stderr.write(`${paint.ok('✔')} bundle  ${result.zipFilePath}\n`);
      }
    } else {
      const input = await readInput(args, flags, io);
      dataset =
        command === 'validate'
          ? validateDataset(flags.input || args.length === 0 ? toLines(input) : input, view)
          : extractDataset(input.join('\n'), view);
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
      shape,
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
    // `dashboard` keeps the event loop alive, so this only takes effect once the server stops
    process.exitCode = code;
  });
}
