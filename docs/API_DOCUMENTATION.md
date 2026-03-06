# API Documentation

## Table of Contents

1. [Numsy Class](#numsy-class)
2. [Parser Class](#parser-class)
3. [PhoneValidator Class](#phonevalidator-class)
4. [FileProcessor Class](#fileprocessor-class)
5. [Interfaces](#interfaces)
6. [Helper Functions](#helper-functions)
7. [Error Handling](#error-handling)

---

## Numsy Class

Main class that provides a unified API for phone number processing.

### Constructor

```typescript
new Numsy(options?: NumsyOptions)
```

**Parameters:**

- `options` (optional): Configuration options
    - `enableLogging?: boolean` - Enable console logging (default: true)
    - `logLevel?: 'log' | 'error' | 'warn' | 'debug' | 'verbose'` - Log level (default: 'log')
    - `throwOnError?: boolean` - Throw errors instead of returning error objects (default: false)

### Methods

#### validate(phone: string): PhoneValidationResult

Validates a single phone number.

**Returns:** Object with validation details

- `original: string` - Original input
- `sanitized: string` - Cleaned phone number
- `isValid: boolean` - Validation result
- `reason?: string` - Reason for failure (if invalid)

#### isValid(phone: string): boolean

Quick validation check.

#### sanitize(phone: string): string

Cleans and normalizes phone number.

#### format(phone: string, withCountryCode?: boolean): string

Formats phone number with optional country code.

#### validateBatch(phones: string[]): PhoneValidationResult[]

Validates multiple phone numbers at once.

#### extractMultiple(text: string): MultipleNumbersResult

Extracts all phone numbers from text.

#### parseFile(filePath: string): Promise<FileParseResult>

Parses CSV or Excel file.

#### processFile(filePath: string, outputDir?: string): Promise<ProcessingResult>

Processes file with phone validation and generates output files.

#### writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void>

Writes data to CSV file.

#### detectPhoneColumn(data: ParsedDataRow[]): string | null

Detects phone number column from data.

---

## Parser Class

Handles file parsing operations.

### Constructor

```typescript
new Parser(options?: ParserOptions)
```

### Methods

Same file-related methods as Numsy class.

---

## PhoneValidator Class

Handles phone number validation.

### Constructor

```typescript
new PhoneValidator(options?: NumsyOptions)
```

### Methods

Same validation methods as Numsy class.

---

## FileProcessor Class

Handles file processing with validation.

### Constructor

```typescript
new FileProcessor(options?: ProcessingOptions)
```

**Options:**

- `outputDir?: string` - Output directory (default: './output')
- `preserveOriginalColumns?: boolean` - Keep original columns (default: true)
- `validateNumbers?: boolean` - Validate phone numbers (default: true)

---

## Interfaces

### NumsyOptions

```typescript
interface NumsyOptions {
  enableLogging?: boolean;
  logLevel?: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
  throwOnError?: boolean;
}
```

### PhoneValidationResult

```typescript
interface PhoneValidationResult {
  original: string;
  sanitized: string;
  isValid: boolean;
  reason?: string;
}
```

### MultipleNumbersResult

```typescript
interface MultipleNumbersResult {
  originalValue: string;
  extractedNumbers: string[];
  validNumbers: string[];
  invalidNumbers: string[];
}
```

### ProcessingResult

```typescript
interface ProcessingResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  phoneColumn: string;
  zipFilePath: string;
  validFilePath: string;
  invalidFilePath: string;
  analyticsFilePath: string;
  analytics: ProcessingAnalytics;
}
```

---

## Helper Functions

Pure utility functions exported for direct use:

### Phone Functions

- `sanitizePhoneNumber(phone: string): string`
- `validatePhoneNumber(phone: string): PhoneValidationResult`
- `extractPhoneNumbers(text: string): string[]`
- `isValidIndianMobile(phone: string): boolean`
- `formatPhoneWithCountryCode(phone: string): string`

### Data Functions

- `normalizeDataRows(data: ParsedDataRow[]): ParsedDataRow[]`
- `detectPhoneColumn(data: ParsedDataRow[]): string | null`
- `removeDuplicates(data: ParsedDataRow[], keyField: string): ParsedDataRow[]`
- `filterRows(data: ParsedDataRow[], predicate: Function): ParsedDataRow[]`

### Validation Functions

- `isNonEmptyString(value: any): boolean`
- `isValidNumber(value: any): boolean`
- `isValidArray(value: any): boolean`
- `isDigitsOnly(value: string): boolean`

---

## Error Handling

### AppError Class

Custom error class for application errors:

```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public details?: any
  )
}
```

### Error Response Interface

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

### Usage

```typescript
import { Numsy, AppError } from 'numsy';

try {
  const numsy = new Numsy({ throwOnError: true });
  await numsy.processFile('./data.csv');
} catch (error) {
  if (error instanceof AppError) {
    console.error(`Error [${error.code}]: ${error.message}`);
  }
}
```
