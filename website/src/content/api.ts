/** Library API reference data. Strings may contain `inline code`. */

export const quickStart = `import { Numsy, toJSON, toCSV, toMarkdown, writeXlsx } from 'numsy';

const numsy = new Numsy({ enableLogging: false });

numsy.validate('+91 98765 01234');
// { original: '+91 98765 01234', sanitized: '9876501234', isValid: true }

numsy.extractMultiple('98765-01234 / 91234 56789');
// { extractedNumbers, validNumbers, invalidNumbers, validCount, invalidCount, totalFound }

const report = await numsy.analyzeFile('contacts.xlsx');
// in-memory: rows, validRows, invalidRows, unique, analytics

await numsy.processFile('contacts.xlsx', './output');
// classic ZIP report bundle`;

export interface ApiMethod {
  name: string;
  signature: string;
  returns: string;
  description: string;
  example?: string;
}

export const methods: ApiMethod[] = [
  {
    name: 'validate',
    signature: 'validate(phone: string)',
    returns: 'PhoneValidationResult',
    description: '`{ original, sanitized, isValid, reason? }` for one value.',
    example: "numsy.validate('098765 01234').isValid; // true",
  },
  {
    name: 'validateBatch',
    signature: 'validateBatch(phones: string[])',
    returns: 'PhoneValidationResult[]',
    description: 'Validate an array of values in one call.',
    example: "numsy.validateBatch(['9876501234', '12345']);",
  },
  {
    name: 'sanitize',
    signature: 'sanitize(phone: string)',
    returns: 'string',
    description: 'Strip non-digits and `+91` / `0` prefixes → bare 10-digit form.',
    example: "numsy.sanitize('+91-98765-01234'); // '9876501234'",
  },
  {
    name: 'isValid',
    signature: 'isValid(phone: string)',
    returns: 'boolean',
    description: 'Fast yes/no check.',
    example: "numsy.isValid('5123456789'); // false",
  },
  {
    name: 'extractMultiple',
    signature: 'extractMultiple(text: string)',
    returns: 'MultipleNumbersResult',
    description: 'Find and validate every number in a string or crowded cell.',
    example: "numsy.extractMultiple('98765-01234 or 91234 56789').validCount; // 2",
  },
  {
    name: 'format',
    signature: 'format(phone: string, withCountryCode = false)',
    returns: 'string',
    description: 'Normalised number, optionally as `+91XXXXXXXXXX`.',
    example: "numsy.format('098765 01234', true); // '+919876501234'",
  },
  {
    name: 'detectPhoneColumn',
    signature: 'detectPhoneColumn(rows: ParsedDataRow[])',
    returns: 'string | null',
    description: 'Guess which column of parsed rows holds phone numbers.',
  },
  {
    name: 'parseFile',
    signature: 'parseFile(filePath: string)',
    returns: 'Promise<FileParseResult>',
    description: 'Parse a `.csv` / `.xlsx` file into rows and headers.',
  },
  {
    name: 'analyzeFile',
    signature: 'analyzeFile(filePath: string, options?: AnalyzeOptions)',
    returns: 'Promise<AnalysisReport>',
    description:
      'In-memory report: `rows`, `validRows`, `invalidRows`, `unique`, `analytics`. Options: `{ phoneColumn?, nameColumn? }`.',
  },
  {
    name: 'analyze',
    signature: 'analyze(rows: ParsedDataRow[], options?: AnalyzeOptions)',
    returns: 'AnalysisReport',
    description: 'Same as `analyzeFile` for rows you already have in memory.',
  },
  {
    name: 'processFile',
    signature: 'processFile(filePath: string, outputDir?: string)',
    returns: 'Promise<ProcessingResult>',
    description: 'Write the classic ZIP report bundle (valid / invalid CSVs + analytics).',
  },
  {
    name: 'writeCsv',
    signature: 'writeCsv(rows: ParsedDataRow[], outputPath: string)',
    returns: 'Promise<void>',
    description: 'Write rows to a CSV file.',
  },
];

export const exporters: { name: string; output: string }[] = [
  { name: 'toJSON(data, { pretty? })', output: 'JSON string (pretty by default)' },
  {
    name: 'toCSV(rows, { columns?, delimiter? })',
    output: 'CSV string (spreadsheet-formula safe)',
  },
  { name: 'toMarkdown(rows, { columns?, title?, summary? })', output: 'Markdown table string' },
  { name: 'toText(values)', output: 'One value per line' },
  { name: 'writeXlsx(sheets, filePath)', output: 'Writes an Excel workbook — Promise<void>' },
  { name: 'toXlsxBuffer(sheets)', output: 'Excel workbook as a Buffer — Promise<Buffer>' },
];

export const exportersExample = `import { Numsy, toCSV, toMarkdown, writeXlsx } from 'numsy';

const numsy = new Numsy({ enableLogging: false });
const report = await numsy.analyzeFile('leads.csv');

const csv = toCSV(report.validRows); // string — write it wherever you like
const md = toMarkdown(report.unique, { title: 'Unique leads' });
await writeXlsx(
  [
    { name: 'Valid', rows: report.validRows },
    { name: 'Invalid', rows: report.invalidRows },
  ],
  'reports/leads.xlsx',
);`;

export const constructorOptions: { name: string; type: string; defaultValue: string }[] = [
  { name: 'enableLogging', type: '`boolean`', defaultValue: '`true`' },
  {
    name: 'logLevel',
    type: "`'log' | 'error' | 'warn' | 'debug' | 'verbose'`",
    defaultValue: "`'log'`",
  },
  { name: 'throwOnError', type: '`boolean`', defaultValue: '`false`' },
  {
    name: 'normalizeColumns',
    type: '`boolean`',
    defaultValue: '`true` — the CLI keeps original headers unless `--normalize` is passed',
  },
];

export const helpers: string[] = [
  'sanitizePhoneNumber',
  'validatePhoneNumber',
  'isValidIndianMobile',
  'extractPhoneNumbers',
  'formatPhoneWithCountryCode',
];
