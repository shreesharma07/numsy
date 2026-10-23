/** CLI reference data (new in 1.2.0). Strings may contain `inline code`. */

export const synopsis = 'numsy <command> [options]';

export const commands: { name: string; description: string }[] = [
  {
    name: 'validate [numbers...]',
    description: 'Validate numbers given as arguments, or one-per-line from stdin.',
  },
  { name: 'extract <text>', description: 'Pull every phone number out of free text (or stdin).' },
  {
    name: 'process <file>',
    description: 'Parse a CSV/XLSX file, detect the phone column, validate, de-dupe and export.',
  },
  { name: 'serve', description: 'Start the web UI + REST API. Alias: `numsy-serve`.' },
  { name: 'formats', description: 'List the available output formats.' },
];

export interface CliOption {
  flag: string;
  scope?: 'process' | 'serve';
  description: string;
  defaultValue: string;
}

export const options: CliOption[] = [
  {
    flag: '-f, --format <list>',
    description: '`table` | `json` | `csv` | `md` | `xlsx` | `txt` — comma-separated for several.',
    defaultValue: '`table`',
  },
  {
    flag: '-o, --output <path>',
    description: 'Output file. Format is inferred from the extension when `--format` is omitted.',
    defaultValue: '—',
  },
  {
    flag: '-d, --out-dir <dir>',
    description: 'Directory for generated files.',
    defaultValue: 'current dir',
  },
  {
    flag: '-n, --name <basename>',
    description: 'Base filename for generated files.',
    defaultValue: '`<input>-numsy` or `numsy-<command>`',
  },
  {
    flag: '--only <set>',
    description: 'Rows to export: `all` | `valid` | `invalid` | `unique`.',
    defaultValue: '`all`',
  },
  {
    flag: '--country-code',
    description: 'Output valid numbers as `+91XXXXXXXXXX`.',
    defaultValue: 'off',
  },
  { flag: '--pretty / --no-pretty', description: 'Pretty-print JSON output.', defaultValue: '—' },
  {
    flag: '--normalize',
    scope: 'process',
    description:
      "Rename known headers, e.g. `'Mobile Number'` → `phone`. By default the original headers are kept.",
    defaultValue: 'off',
  },
  {
    flag: '--bundle',
    scope: 'process',
    description: 'Also write the classic ZIP report bundle.',
    defaultValue: 'off',
  },
  {
    flag: '-c, --column <name>',
    scope: 'process',
    description: 'Phone column name.',
    defaultValue: 'auto-detect',
  },
  {
    flag: '--fail-on-invalid',
    description: 'Exit with code `2` if any invalid number is found (CI friendly).',
    defaultValue: 'off',
  },
  { flag: '-q, --quiet', description: 'Suppress summary output.', defaultValue: 'off' },
  {
    flag: '-p, --port <n>',
    scope: 'serve',
    description: 'Port to listen on.',
    defaultValue: '`3000`',
  },
  { flag: '-v, --version · -h, --help', description: 'Print version / help.', defaultValue: '—' },
];

export const examples: { title: string; command: string }[] = [
  {
    title: 'Validate arguments (no install needed)',
    command: 'npx @numsy/numsy validate 9876501234 "+91 98765 43210"',
  },
  {
    title: 'Validate one-per-line from stdin, print JSON',
    command: 'cat numbers.txt | numsy validate -f json',
  },
  {
    title: 'Extract numbers from free text as a Markdown table',
    command: 'numsy extract "Call 98765-01234 or 0 91234 56789" -f md',
  },
  {
    title: 'Clean a spreadsheet into three formats at once',
    command: 'numsy process contacts.xlsx -f json,csv,xlsx -d reports -n contacts-clean',
  },
  {
    title: 'Export only unique valid numbers',
    command: 'numsy process leads.csv --only unique -o unique.csv',
  },
  {
    title: 'Normalise headers ("Mobile Number" → phone) while exporting',
    command: 'numsy process leads.xlsx --normalize -f csv',
  },
  {
    title: 'CI gate: Excel with +91 numbers, exit 2 on any invalid row',
    command: 'numsy process leads.csv -f xlsx --country-code --fail-on-invalid',
  },
  { title: 'Web UI + REST API on a custom port', command: 'numsy serve --port 8080' },
];

export const exitCodes: { code: string; meaning: string }[] = [
  { code: '0', meaning: 'Success.' },
  { code: '2', meaning: 'At least one invalid number was found and `--fail-on-invalid` was set.' },
];
