/** CLI reference data. Strings may contain `inline code`. */

export const synopsis = 'numsy <command> [options]';

export const commands: { name: string; description: string }[] = [
  {
    name: 'validate [numbers...]',
    description: 'Validate numbers given as arguments, from `--input`, or one per line on stdin.',
  },
  { name: 'extract <text>', description: 'Pull every phone number out of free text (or stdin).' },
  {
    name: 'process <file>',
    description: 'Parse a CSV/XLSX file, detect the phone column, validate, de-dupe and export.',
  },
  {
    name: 'dashboard',
    description:
      'Open the local dashboard + REST API on `http://localhost:6789`. Aliases: `serve`, `ui`.',
  },
  { name: 'formats', description: 'List the available output formats.' },
];

export interface CliOption {
  flag: string;
  scope?: 'process' | 'dashboard';
  description: string;
  defaultValue: string;
}

export interface CliOptionGroup {
  title: string;
  options: CliOption[];
}

export const optionGroups: CliOptionGroup[] = [
  {
    title: 'Output',
    options: [
      {
        flag: '-f, --format <list>',
        description:
          '`table` | `json` | `csv` | `md` | `xlsx` | `txt`, comma-separated for several.',
        defaultValue: '`table`',
      },
      {
        flag: '-o, --output <path>',
        description:
          'Output file. The format is inferred from the extension when `--format` is omitted.',
        defaultValue: 'none',
      },
      {
        flag: '-d, --out-dir <dir>',
        description: 'Directory for generated files.',
        defaultValue: 'current dir',
      },
      {
        flag: '-n, --name <basename>',
        description: 'Base filename for generated files.',
        defaultValue: '`<input>-numsy`',
      },
      {
        flag: '--only <set>',
        description: 'Rows to export: `all` | `valid` | `invalid` | `unique` | `duplicates`.',
        defaultValue: '`all`',
      },
      {
        flag: '--number-style <s>',
        description: '`plain` (9876501234) | `e164` (+919876501234) | `spaced` (+91 98765 01234).',
        defaultValue: '`plain`',
      },
      {
        flag: '--country-code',
        description: 'Shorthand for `--number-style e164`.',
        defaultValue: 'off',
      },
      {
        flag: '--columns <c>',
        description: '`full` keeps every column; `numbers` keeps only the name and number.',
        defaultValue: '`full`',
      },
      {
        flag: '--header-name <h>',
        description: 'Rename the number column in exports, e.g. `Mobile`.',
        defaultValue: 'key name',
      },
      {
        flag: '--no-header',
        description: 'Leave the header row out of CSV and Excel output.',
        defaultValue: 'off',
      },
      {
        flag: '--max-rows <n>',
        description: 'Export at most `n` rows; `0` exports all.',
        defaultValue: '`0`',
      },
      { flag: '--no-pretty', description: 'Compact JSON.', defaultValue: 'off' },
      {
        flag: '--limit <n>',
        description: 'Rows shown in the terminal table; `0` shows all.',
        defaultValue: '`50`',
      },
    ],
  },
  {
    title: 'Filters',
    options: [
      {
        flag: '--dedupe',
        description: 'Drop repeat occurrences of a number, keeping the first.',
        defaultValue: 'off',
      },
      {
        flag: '--keep <first|last>',
        description: 'Drop repeats, keeping the first or the last occurrence.',
        defaultValue: 'none',
      },
      {
        flag: '--loose',
        description: 'Accept dummy patterns such as `9999999999`; only the shape is checked.',
        defaultValue: 'off',
      },
      {
        flag: '--first-only',
        scope: 'process',
        description: 'Keep only the first valid number of each cell.',
        defaultValue: 'off',
      },
      {
        flag: '--skip-empty',
        scope: 'process',
        description: 'Leave rows with an empty phone cell out of the invalid set.',
        defaultValue: 'off',
      },
    ],
  },
  {
    title: 'Input & behaviour',
    options: [
      {
        flag: '-i, --input <file>',
        description: 'Read values from a text file (validate/extract).',
        defaultValue: 'none',
      },
      {
        flag: '-c, --column <name>',
        scope: 'process',
        description: 'Phone column.',
        defaultValue: 'auto-detect',
      },
      {
        flag: '--name-column <c>',
        scope: 'process',
        description: 'Contact-name column; `none` disables it.',
        defaultValue: 'auto-detect',
      },
      {
        flag: '--normalize',
        scope: 'process',
        description: "Rename known headers, e.g. `'Mobile Number'` → `phone`.",
        defaultValue: 'off',
      },
      {
        flag: '--bundle',
        scope: 'process',
        description: 'Also write the classic ZIP report bundle.',
        defaultValue: 'off',
      },
      {
        flag: '--fail-on-invalid',
        description: 'Exit with code `2` if any invalid number is found (CI friendly).',
        defaultValue: 'off',
      },
      { flag: '-q, --quiet', description: 'Only print the requested output.', defaultValue: 'off' },
      {
        flag: '--no-color',
        description: 'Disable colours (also honours `NO_COLOR`).',
        defaultValue: 'off',
      },
      {
        flag: '-v, --version · -h, --help',
        description: 'Print version / help.',
        defaultValue: 'none',
      },
    ],
  },
  {
    title: 'Dashboard',
    options: [
      {
        flag: '-p, --port <n>',
        scope: 'dashboard',
        description: 'Port; the next free one is used when busy. `PORT` also works.',
        defaultValue: '`6789`',
      },
      {
        flag: '--host <addr>',
        scope: 'dashboard',
        description:
          'Interface to listen on. The default only accepts connections from this machine.',
        defaultValue: '`127.0.0.1`',
      },
      {
        flag: '--open',
        scope: 'dashboard',
        description: 'Open the dashboard in your browser.',
        defaultValue: 'off',
      },
    ],
  },
];

/** Every option, for search and counts */
export const options: CliOption[] = optionGroups.flatMap((group) => group.options);

export const examples: { title: string; command: string }[] = [
  {
    title: 'Validate arguments (no install needed)',
    command: 'npx numsy validate 9876501234 "+91 98765 43210"',
  },
  {
    title: 'Validate one-per-line from stdin, drop repeats, print JSON',
    command: 'cat numbers.txt | numsy validate -f json --dedupe',
  },
  {
    title: 'Extract numbers from free text as a Markdown report',
    command: 'numsy extract "Call 98765-01234 or 0 91234 56789" -f md',
  },
  {
    title: 'Clean a spreadsheet into three formats at once',
    command: 'numsy process contacts.xlsx -f json,csv,xlsx -d reports -n contacts-clean',
  },
  {
    title: 'De-duplicated valid numbers only, as name + Mobile',
    command:
      'numsy process leads.csv --dedupe --only valid --columns numbers --header-name Mobile -o clean.csv',
  },
  {
    title: 'First 500 unique numbers, no header row, +91 format',
    command:
      'numsy process leads.xlsx --only unique --number-style e164 --no-header --max-rows 500 -o top.csv',
  },
  {
    title: 'CI gate: exit 2 on any invalid row',
    command: 'numsy process leads.csv -f xlsx --fail-on-invalid -q',
  },
  { title: 'Local dashboard in your browser', command: 'numsy dashboard --open' },
];

export const exitCodes: { code: string; meaning: string }[] = [
  { code: '0', meaning: 'Success.' },
  { code: '1', meaning: 'Bad usage or an unreadable input (the message says which).' },
  { code: '2', meaning: 'At least one invalid number was found and `--fail-on-invalid` was set.' },
];
