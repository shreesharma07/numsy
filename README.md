<div align="center">

# _Numsy_ - _A light-weight number processor_

[![NPM Version](https://img.shields.io/npm/v/@numsy/numsy.svg?style=flat-square)](https://www.npmjs.com/package/@numsy/numsy)
[![NPM Downloads](https://img.shields.io/npm/dm/@numsy/numsy.svg?style=flat-square)](https://www.npmjs.com/package/@numsy/numsy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node Version](https://img.shields.io/node/v/@numsy/numsy.svg?style=flat-square)](https://nodejs.org)
[![CI/CD Pipeline](https://github.com/shreesharma07/numsy/actions/workflows/main.yml/badge.svg)](https://github.com/shreesharma07/numsy/actions/workflows/main.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/shreesharma07/numsy/security.yml?style=flat-square&label=Security&logo=github)](https://github.com/shreesharma07/numsy/actions/workflows/security.yml)
[![codecov](https://codecov.io/gh/shreesharma07/numsy/graph/badge.svg?token=A9H550XJVW)](https://codecov.io/gh/shreesharma07/numsy)
[![Known Vulnerabilities](https://snyk.io/test/github/shreesharma07/numsy/badge.svg?style=flat-square)](https://snyk.io/test/github/shreesharma07/numsy)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/shreesharma07/numsy/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Package Manager](https://img.shields.io/badge/pnpm-8.15.0-F69220?style=flat-square&logo=pnpm)](https://pnpm.io/)

[![GitHub stars](https://img.shields.io/github/stars/shreesharma07/numsy?style=social)](https://github.com/shreesharma07/numsy/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/shreesharma07/numsy?style=social)](https://github.com/shreesharma07/numsy/network/members)

</div>

**Numsy** is a light-weight TypeScript library for Indian phone number validation, sanitization, and CSV/Excel file processing. Built with class-based architecture, comprehensive error handling, and extensive logging capabilities.\*

## ✨ Features

- 🔢 **Phone Number Validation** - Validate Indian mobile numbers (10-digit starting with 6-9)
- 🧹 **Smart Sanitization** - Clean and normalize phone numbers from various formats
- 📊 **File Processing** - Parse CSV and Excel files with automatic phone column detection
- 🔍 **Multiple Number Extraction** - Extract multiple phone numbers from text
- 📝 **Comprehensive Logging** - Built-in logging with configurable log levels
- 🛡️ **Error Handling** - Try-catch blocks everywhere with custom error classes
- 🎯 **TypeScript Support** - Full type definitions included
- ⚡ **Fast Compilation** - Built with SWC for lightning-fast builds
- 🧪 **Well Tested** - Comprehensive test coverage
- 📦 **Modular Architecture** - Use individual components or the unified API
- 🎨 **Class-Based Design** - Modern, maintainable, and extensible
- 📚 **Helper Functions** - Extensive utility functions for common tasks

## 📦 Installation

```bash
npm install numsy
```

```bash
pnpm add numsy
```

```bash
yarn add numsy
```

## 🚀 Quick Start

### Basic Usage

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();

// Validate a phone number
const result = numsy.validate('9876543210');
console.log(result);
// { original: '9876543210', sanitized: '9876543210', isValid: true }

// Check if valid
console.log(numsy.isValid('9876543210')); // true

// Sanitize number
console.log(numsy.sanitize('+91-987-654-3210')); // '9876543210'

// Format with country code
console.log(numsy.format('9876543210', true)); // '+919876543210'
```

### Using Parser

```typescript
import { Parser } from 'numsy';
// or
import parser from 'numsy/parser';

const parser = new Parser();

// Parse CSV file
const result = await parser.parseFile('./contacts.csv');
console.log(result.data);
console.log(result.totalRows);
```

### Process Files

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();

// Process file with validation
const result = await numsy.processFile('./contacts.csv', './output');
console.log(`Processed ${result.totalRecords} records`);
console.log(`Valid: ${result.validRecords}, Invalid: ${result.invalidRecords}`);
```

## 🖥️ CLI Usage

Numsy includes a built-in server with a web interface for processing phone numbers without writing code.

### Starting the Server

**After installing the package:**

```bash
# Using npx (recommended - no installation needed)
npx @numsy/numsy-serve

# Or install globally first
npm install -g @numsy/numsy
numsy-serve

# With custom options
npx @numsy/numsy-serve --port 3000
npx @numsy/numsy-serve --page
npx @numsy/numsy-serve -p 8080 --page

# Display help
npx @numsy/numsy-serve --help
```

**For local development (in this repository):**

```bash
# Using pnpm scripts
pnpm run serve

# Or using npm scripts
npm run serve

# Or directly with ts-node
npx ts-node src/cli/server.ts

# With options (requires -- separator)
pnpm run serve -- --port 3000
pnpm run serve -- --page
```

### CLI Options

| Option            | Alias           | Description                      | Default |
| ----------------- | --------------- | -------------------------------- | ------- |
| `--port <number>` | `-p`            | Specify port number (1024-65535) | 3000    |
| `--page`          | `-s`, `--serve` | Serve the HTML utility page      | false   |
| `--help`          | `-h`            | Display help message             | -       |

### Environment Variables

You can also configure the server using environment variables:

```bash
# Set port via environment variable
PORT=3000 npx @numsy/numsy-serve

# Set environment mode
NODE_ENV=production npx @numsy/numsy-serve
```

### Server Features

- ✅ **Auto Port Detection** - Automatically finds an available port if default is in use
- 🌐 **CORS Enabled** - Works with any frontend application
- 🔌 **REST API** - Access validation endpoints programmatically
- 💚 **Health Check** - Built-in health check endpoint
- 🎯 **Global API Prefix** - All endpoints under `/api`
- 🛡️ **Graceful Shutdown** - Handles SIGTERM and SIGINT signals

### API Endpoints

Once the server is running, you can access:

- **Health Check**: `http://localhost:3000/api/health`
- **API Base**: `http://localhost:3000/api`
- **Utility Page** (with `--page` flag): `http://localhost:3000`

### Example Server Output

```markdown
╔═══════════════════════════════════════════════════════════════╗
║ ✅ Server Started Successfully ║
╚═══════════════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:3000
📡 API endpoint: http://localhost:3000/api
💚 Health check: http://localhost:3000/api/health
🌐 Utility page: http://localhost:3000

📝 Environment: development
⚡ Process ID: 12345

Press Ctrl+C to stop the server
```

## 💡 API Examples

### Phone Validation

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();

// Single validation
const result = numsy.validate('9876543210');

// Batch validation
const numbers = ['9876543210', '8123456789', '1234567890'];
const results = numsy.validateBatch(numbers);

// Extract multiple numbers from text
const text = 'Contact me at 9876543210 or 8123456789';
const extracted = numsy.extractMultiple(text);
console.log(extracted.validNumbers); // ['9876543210', '8123456789']
```

### File Operations

```typescript
import Numsy from 'numsy';

const numsy = new Numsy();

// Parse file
const parsed = await numsy.parseFile('./data.csv');

// Process with validation
const result = await numsy.processFile('./data.csv', './output');

// Write to CSV
await numsy.writeCsv(data, './output/clean-data.csv');
```

### Using Individual Components

```typescript
import { Parser, PhoneValidator, FileProcessor } from 'numsy';

// Use Parser separately
const parser = new Parser({
  normalizeColumns: true,
  detectPhoneColumn: true,
});

// Use PhoneValidator separately
const validator = new PhoneValidator({
  enableLogging: false,
});

// Use FileProcessor separately
const processor = new FileProcessor({
  outputDir: './output',
});
```

## 🎯 Configuration Options

```typescript
import Numsy from 'numsy';

const numsy = new Numsy({
  enableLogging: true, // Enable console logging
  logLevel: 'debug', // Log level: 'log' | 'error' | 'warn' | 'debug' | 'verbose'
  throwOnError: false, // Throw errors vs return error objects
});

// Update options at runtime
numsy.setOptions({ enableLogging: false });
```

## 📚 API Reference

### Numsy Class

Main class providing unified API:

#### Methods

- `validate(phone: string): PhoneValidationResult` - Validate single phone number
- `validateBatch(phones: string[]): PhoneValidationResult[]` - Validate multiple numbers
- `sanitize(phone: string): string` - Clean phone number
- `isValid(phone: string): boolean` - Quick validation check
- `format(phone: string, withCountryCode?: boolean): string` - Format phone number
- `extractMultiple(text: string): MultipleNumbersResult` - Extract numbers from text
- `parseFile(filePath: string): Promise<FileParseResult>` - Parse CSV/Excel file
- `processFile(filePath: string, outputDir?: string): Promise<ProcessingResult>` - Process file with validation
- `writeCsv(data: ParsedDataRow[], outputPath: string): Promise<void>` - Write to CSV
- `detectPhoneColumn(data: ParsedDataRow[]): string | null` - Detect phone column

### Parser Class

File parsing operations:

- `parseFile(filePath: string): Promise<FileParseResult>` - Parse file
- `writeCsv(data, outputPath): Promise<void>` - Write CSV
- `writeProcessedFiles(validData, invalidData, validPath, invalidPath): Promise<void>` - Write multiple files

### PhoneValidator Class

Phone validation operations:

- `validate(phone: string): PhoneValidationResult` - Validate number
- `validateBatch(phones: string[]): PhoneValidationResult[]` - Batch validation
- `sanitize(phone: string): string` - Sanitize number
- `isValid(phone: string): boolean` - Check validity
- `extractMultiple(text: string): MultipleNumbersResult` - Extract numbers
- `format(phone: string, withCountryCode?: boolean): string` - Format number

### Helper Functions

Pure utility functions:

```typescript
import {
  sanitizePhoneNumber,
  validatePhoneNumber,
  extractPhoneNumbers,
  normalizeDataRows,
  detectPhoneColumn,
  isNonEmptyString,
  isValidNumber,
  LoggerHelper,
  AppError,
} from 'numsy';
```

## 🏗️ Architecture

Numsy follows a modern, class-based architecture:

```markdown
src/
├── common/
│ ├── interfaces/ # TypeScript interfaces
│ ├── functions/ # Pure utility functions
│ └── helpers/ # Helper classes (Logger, Error, File, Validation)
├── core/
│ ├── Numsy.ts # Main class
│ ├── Parser.ts # File parser
│ ├── PhoneValidator.ts # Phone validator
│ └── FileProcessor.ts # File processor
└── index.ts # Package entry point
```

## 🔧 Development

### Setup

```bash
# Install dependencies
pnpm install

# Build package
pnpm run build

# Run tests
pnpm test

# Development with auto-reload
pnpm run dev

# Start server (for web interface)
pnpm run start:dev
```

### Scripts

- `pnpm run build` - Build with SWC (fast compilation)
- `pnpm run build:nest` - Build with Nest CLI
- `pnpm run dev` - Development mode with nodemon
- `pnpm run test` - Run tests
- `pnpm run test:watch` - Watch mode
- `pnpm run test:cov` - Coverage report
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## 📖 Documentation

- [Usage Examples](./docs/USAGE_EXAMPLES.md) - Comprehensive usage examples
- [API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [Quick Start Guide](./docs/QUICKSTART.md) - Get started quickly
- [Publishing Guide](./docs/NPM_PUBLISHING_GUIDE.md) - NPM publishing guide

## 🧪 Testing

Numsy includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov
```

## 🛡️ Error Handling

Numsy provides comprehensive error handling:

```typescript
import { Numsy, AppError } from 'numsy';

try {
  const numsy = new Numsy({ throwOnError: true });
  const result = await numsy.processFile('./data.csv');
} catch (error) {
  if (error instanceof AppError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    console.error('Details:', error.details);
  }
}
```

## 📝 TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import {
  Numsy,
  NumsyOptions,
  PhoneValidationResult,
  MultipleNumbersResult,
  ProcessingResult,
  FileParseResult,
  ParsedDataRow,
} from 'numsy';

const options: NumsyOptions = {
  enableLogging: true,
  logLevel: 'debug',
  throwOnError: false,
};

const numsy = new Numsy(options);
const result: PhoneValidationResult = numsy.validate('9876543210');
```

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

### Shri Kumar Sharma

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/numsy)
- [GitHub Repository](https://github.com/your-username/numsy)
- [Documentation](./docs/)
- [Issue Tracker](https://github.com/your-username/numsy/issues)

## 🌟 Support

If you find this package helpful, please give it a star on GitHub!

## 📊 Stats

- **Bundle Size**: Optimized and tree-shakeable
- **TypeScript**: 100% TypeScript codebase
- **Test Coverage**: Comprehensive test suite
- **Dependencies**: Minimal and well-maintained

## 🚀 Optimizations

- ⚡ **SWC Compilation** - 20x faster than TypeScript compiler
- 🎯 **Tree-Shakeable** - Import only what you need
- 📦 **Modular Design** - Use individual components
- 🔧 **Zero Config** - Works out of the box
- 🛡️ **Type Safe** - Full TypeScript support

---

## 👤 Contributors
<a href="https://github.com/shreesharma07/numsy/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=shreesharma07/numsy" />
</a>

---

Made with ❤️ by **Shri Kumar Sharma**
