# Numsy - Usage Examples

## Installation

```bash
npm install numsy
# or
pnpm add numsy
# or
yarn add numsy
```

## Basic Usage

### Method 1: Using default export

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();

// Validate a phone number
const result = numsy.validate('9876543210');
console.log(result);
// { original: '9876543210', sanitized: '9876543210', isValid: true }

// Check if valid
const isValid = numsy.isValid('9876543210');
console.log(isValid); // true

// Sanitize phone number
const sanitized = numsy.sanitize('+91-987-654-3210');
console.log(sanitized); // '9876543210'

// Format with country code
const formatted = numsy.format('9876543210', true);
console.log(formatted); // '+919876543210'
```

### Method 2: Using named imports

```typescript
import { Numsy } from 'numsy';

const numsy = new Numsy({
  enableLogging: true,
  logLevel: 'debug',
  throwOnError: false
});
```

### Method 3: Using Parser directly

```typescript
import { Parser } from 'numsy';
// or
import parser from 'numsy/parser';

const parser = new Parser();

// Parse CSV file
const result = await parser.parseFile('./data.csv');
console.log(result.data);
console.log(result.totalRows);
console.log(result.detectedColumns);
```

## Advanced Usage

### Processing Files

```typescript
import { Numsy } from 'numsy';

const numsy = new Numsy();

// Process a file with phone number validation
const result = await numsy.processFile('./contacts.csv', './output');

console.log(`Total Records: ${result.totalRecords}`);
console.log(`Valid Records: ${result.validRecords}`);
console.log(`Invalid Records: ${result.invalidRecords}`);
console.log(`Phone Column: ${result.phoneColumn}`);
console.log(`ZIP File: ${result.zipFilePath}`);
```

### Batch Validation

```typescript
import { Numsy } from 'numsy';

const numsy = new Numsy();

const numbers = [
  '9876543210',
  '8123456789',
  '1234567890',  // Invalid
  '+91-7987654321'
];

const results = numsy.validateBatch(numbers);
results.forEach((result, index) => {
  console.log(`${numbers[index]}: ${result.isValid ? 'Valid' : 'Invalid'}`);
  if (!result.isValid) {
    console.log(`  Reason: ${result.reason}`);
  }
});
```

### Extract Multiple Numbers

```typescript
import { Numsy } from 'numsy';

const numsy = new Numsy();

const text = 'Contact me at 9876543210 or 8123456789 for more info';
const result = numsy.extractMultiple(text);

console.log('Extracted Numbers:', result.extractedNumbers);
console.log('Valid Numbers:', result.validNumbers);
console.log('Invalid Numbers:', result.invalidNumbers);
```

### Using Individual Components

```typescript
import { Parser, PhoneValidator, FileProcessor } from 'numsy';

// Use Parser independently
const parser = new Parser({
  normalizeColumns: true,
  detectPhoneColumn: true
});
const parseResult = await parser.parseFile('./data.csv');

// Use PhoneValidator independently
const validator = new PhoneValidator({
  enableLogging: false
});
const validationResult = validator.validate('9876543210');

// Use FileProcessor independently
const processor = new FileProcessor({
  outputDir: './output',
  validateNumbers: true
});
const processResult = await processor.processFile('./data.csv');
```

### Custom Configuration

```typescript
import { Numsy } from 'numsy';

const numsy = new Numsy({
  enableLogging: true,
  logLevel: 'verbose',
  throwOnError: true
});

// Update options at runtime
numsy.setOptions({
  enableLogging: false
});

// Get current options
const options = numsy.getOptions();
console.log(options);
```

### Working with Data

```typescript
import { Numsy } from 'numsy';

const numsy = new Numsy();

// Parse file
const parsed = await numsy.parseFile('./contacts.csv');

// Detect phone column
const phoneColumn = numsy.detectPhoneColumn(parsed.data);
console.log(`Phone column detected: ${phoneColumn}`);

// Write to CSV
const validData = parsed.data.filter(row => {
  return numsy.isValid(row[phoneColumn]);
});
await numsy.writeCsv(validData, './output/valid-contacts.csv');
```

## Using Helper Functions

```typescript
import {
  sanitizePhoneNumber,
  validatePhoneNumber,
  extractPhoneNumbers,
  normalizeDataRows,
  detectPhoneColumn
} from 'numsy';

// Use pure functions directly
const sanitized = sanitizePhoneNumber('+91-987-654-3210');
const validation = validatePhoneNumber('9876543210');
const extracted = extractPhoneNumbers('Call 9876543210 or 8123456789');

// Data manipulation functions
const data = [
  { Name: 'John', Phone: '9876543210' },
  { Name: 'Jane', Mobile: '8123456789' }
];
const normalized = normalizeDataRows(data);
const phoneCol = detectPhoneColumn(data);
```

## Error Handling

```typescript
import { Numsy, AppError } from 'numsy';

const numsy = new Numsy({ throwOnError: true });

try {
  const result = await numsy.processFile('./contacts.csv');
  console.log('Success:', result);
} catch (error) {
  if (error instanceof AppError) {
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Error Details:', error.details);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

All types are exported for TypeScript users:

```typescript
import {
  Numsy,
  NumsyOptions,
  PhoneValidationResult,
  MultipleNumbersResult,
  ProcessingResult,
  FileParseResult,
  ParsedDataRow,
  ProcessingOptions,
  ParserOptions
} from 'numsy';

const options: NumsyOptions = {
  enableLogging: true,
  logLevel: 'debug',
  throwOnError: false
};

const numsy = new Numsy(options);

const result: PhoneValidationResult = numsy.validate('9876543210');
```

## API Documentation

### Numsy Class

#### Constructor

- `new Numsy(options?: NumsyOptions)`

#### Methods

- `validate(phone: string): PhoneValidationResult`
- `validateBatch(phones: string[]): PhoneValidationResult[]`
- `sanitize(phone: string): string`
- `isValid(phone: string): boolean`
- `extractMultiple(text: string): MultipleNumbersResult`
- `format(phone: string, withCountryCode?: boolean): string`
- `parseFile(filePath: string): Promise<FileParseResult>`
- `processFile(filePath: string, outputDir?: string): Promise<ProcessingResult>`
- `writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void>`
- `detectPhoneColumn(data: ParsedDataRow[]): string | null`
- `getParser(): Parser`
- `getValidator(): PhoneValidator`
- `getProcessor(): FileProcessor`
- `setOptions(options: Partial<NumsyOptions>): void`
- `getOptions(): NumsyOptions`

### Parser Class

Similar API as Numsy for file parsing operations.

### PhoneValidator Class

Similar API as Numsy for phone validation operations.

### FileProcessor Class

Handles file processing with validation.

## Examples by Use Case

### Use Case 1: Validate Single Numbers

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();

const phone = '9876543210';
if (numsy.isValid(phone)) {
  console.log('Valid phone number!');
}
```

### Use Case 2: Clean Contact Database

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();
const result = await numsy.processFile('./contacts.csv', './clean-contacts');

console.log(`Cleaned ${result.validRecords} valid contacts`);
console.log(`Removed ${result.invalidRecords} invalid entries`);
```

### Use Case 3: Extract Numbers from Text

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();
const text = document.getElementById('input').value;
const result = numsy.extractMultiple(text);

console.log('Found numbers:', result.validNumbers);
```
