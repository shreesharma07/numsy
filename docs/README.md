# 📱 Number Processor

[![npm version](https://badge.fury.io/js/numsy.svg)](https://badge.fury.io/js/numsy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)

A TypeScript-based phone number processor with CSV/Excel parsing capabilities built with NestJS. This application validates and sanitizes Indian phone numbers, providing a clean way to process bulk contact data.

## 🚀 Features

- ✅ **CSV & Excel Support** - Parse both CSV and Excel (.xlsx, .xls) files
- 📱 **Indian Phone Number Validation** - Validates 10-digit Indian mobile numbers
- 🔢 **Multiple Numbers Per Row** - Extract and process multiple phone numbers from a single cell separated by `/`, `-`, or spaces
- 🧹 **Advanced Sanitization** - Removes +, +91, 0091, spaces, hyphens, dots, and other separators
- 🔍 **Intelligent Column Detection** - Recognizes 120+ phone field name variations using regex-based analysis
- 🎯 **Flexible Field Support** - All fields except phone numbers are optional
- 📊 **Comprehensive Analytics** - Detailed text report with statistics, carrier distribution, duplicates, and more
- 📈 **Detailed Reports** - Generates CSV files for valid and invalid numbers plus analytics text file
- 📦 **ZIP Download** - Download processed files as a convenient ZIP archive
- 🎨 **Drag & Drop UI** - Modern, intuitive web interface with real-time analytics
- 🗑️ **Automatic Cleanup** - Removes temporary files after download

## 📋 Supported Fields

### Required Field: Phone Numbers

The application focuses on extracting phone numbers and recognizes **120+ field name variations**, including:

**Common Names:**

- `phone`, `mobile`, `contact`, `telephone`, `cell`, `tel`
- `phone_number`, `mobile_number`, `contact_number`
- `phonenumber`, `mobilenumber`, `contactnumber`

**Carrier/Type Specific:**

- `whatsapp`, `whatsapp_number`, `whatsapp_mobile`
- `customer_phone`, `client_mobile`, `business_phone`
- `office_phone`, `work_mobile`, `home_phone`, `personal_mobile`

**Context Specific:**

- `primary_phone`, `secondary_mobile`, `alternate_phone`
- `emergency_contact`, `registered_mobile`, `verified_phone`
- `user_phone`, `login_mobile`, `otp_phone`

**Abbreviated:**

- `phone_no`, `mobile_no`, `contact_no`, `tel_no`

**And many more variations with different separators (spaces, underscores, dots, etc.)**

The system uses regex-based pattern matching to intelligently detect phone columns regardless of naming convention.

### Optional Fields (Preserved if Present)

All other fields in your CSV/Excel file are **optional** and will be preserved in the output:

- Names, addresses, emails, IDs, custom fields, etc.
- The phone column is the only required field
- All other columns are automatically carried over to output files

## 🛠️ Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **csv-parser** - CSV file parsing
- **csv-writer** - CSV file generation
- **xlsx** - Excel file processing
- **archiver** - ZIP file creation
- **multer** - File upload handling

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- pnpm (v8 or higher)

**Install pnpm** (if not already installed):

```bash
npm install -g pnpm
# or use Node.js Corepack
corepack enable
```

### Setup

1. Clone the repository:

```bash
cd number-processor
```

1. Install dependencies:

```bash
pnpm install
```

1. Build the project:

```bash
pnpm run build
```

## 🎯 Usage

### Development Mode

Start the development server with hot-reload:

```bash
pnpm run start:dev
```

The application will be available at `http://localhost:3000`

### Production Mode

Build and run in production:

```bash
pnpm run build
pnpm run start:prod
```

## 📝 API Endpoints

### Health Check

```http
GET /api/health
```

Returns server health status.

### Upload File

```http
POST /api/upload
```

**Request:**

- Content-Type: `multipart/form-data`
- Field name: `file`
- Accepted formats: `.csv`, `.xlsx`, `.xls`
- Max size: 10MB

**Response:**

```json
{
  "success": true,
  "message": "File processed successfully",
  "downloadId": "processed_1234567890",
  "summary": {
    "totalRecords": 100,
    "validRecords": 85,
    "invalidRecords": 15,
    "phoneColumnDetected": "phone",
    "analytics": {
      "totalNumbersExtracted": 120,
      "totalValidNumbers": 85,
      "totalInvalidNumbers": 35,
      "recordsWithMultipleNumbers": 18,
      "averageNumbersPerRecord": 1.2,
      "duplicateNumbers": 5,
      "uniqueValidNumbers": 80
    }
  }
}
```

### Download Processed Files

```http
GET /api/download/:id
```

Downloads a ZIP file containing:

1. **valid_numbers_*.csv** - All valid phone numbers with associated data
2. **invalid_numbers_*.csv** - All invalid phone numbers with validation reasons
3. **analytics_*.txt** - Comprehensive analytics report

### Analytics Report Contents

The analytics text file includes:

**Summary Statistics:**

- Total records processed
- Extraction and validation results
- Success and deduplication rates

**Carrier Series Distribution:**

- Distribution by first digit (6, 7, 8, 9 series)
- Percentage breakdown

**Top Number Prefixes:**

- Most common 4-digit prefixes
- Frequency analysis

**Duplicate Detection:**

- List of duplicate numbers
- Occurrence counts

**Field Distribution:**

- All fields detected in input
- Usage statistics per field

**Validation Details:**

- Rules applied
- Invalid number reasons
- Recommendations for data quality

## 🔧 Phone Number Extraction & Validation

### Multiple Numbers Per Row

The application can now extract and process multiple phone numbers from a single cell:

**Supported Separators:**

- Forward Slash: `/`
- Hyphen: `-`
- Multiple Spaces: Two or more spaces between numbers

**Example Input:**

```csv
Customer Name,Mobile Number,City
John Doe,9876543210 / 8765432109,Mumbai
Jane Smith,7654321098-9876543211,Delhi
Bob Wilson,8765432109  9876543212,Bangalore
```

**Output Behavior:**

- Each valid number will be extracted into a separate row in the output CSV
- All other fields (Customer Name, City, etc.) will be duplicated for each valid number
- Invalid numbers within the same cell are tracked separately

**Analytics Provided:**

- Total numbers extracted from all rows
- Count of rows containing multiple numbers
- Average numbers per record
- Duplicate detection across the entire dataset
- Unique valid numbers count
- Carrier series distribution
- Prefix frequency analysis

### Validation Rules

**Valid Numbers:**

- Must be exactly 10 digits after sanitization
- Must start with 6, 7, 8, or 9 (Indian mobile number format)
- Can contain separators (spaces, hyphens, dots, parentheses) which will be removed
- Country codes are automatically stripped: `+91`, `0091`, `91`
- Leading zeros are removed (handles format: `09876543210`)

**Automatic Sanitization:**

- Removes: `+`, `-`, ` ` (spaces), `.`, `(`, `)`
- Strips country codes: `+91`, `0091`, `91`
- Handles various formats uniformly

### Examples of Valid Inputs

**Single Numbers:**

- `9876543210` - Standard format
- `98765-43210` - With hyphens
- `98765 43210` - With spaces
- `+91 9876543210` - With country code and plus
- `+919876543210` - Compact format with plus
- `0091 9876543210` - International format
- `919876543210` - With country code (no plus)
- `9876 543 210` - Multiple spaces
- `9876.543.210` - With dots
- `(98765) 43210` - With parentheses
- `09876543210` - With leading zero

**Multiple Numbers (Separated):**

- `+91 9876543210`
- `919876543210`
- `9876 543 210`
- `9876543210 / 8765432109` (multiple numbers)
- `7654321098-9876543211` (multiple numbers)
- `8765432109  9876543212` (multiple numbers with spaces)+91) is automatically stripped

### Examples of Valid Inputs

- `9876543210`
- `98765-43210`
- `98765 43210`
- `+91 9876543210`
- `919876543210`
- `9876 543 210`

### Invalid Numbers

- Less or more than 10 digits (after sanitization)
- Starting with digits other than 6, 7, 8, or 9
- All same digits (e.g., `9999999999`)
- Non-numeric characters (after removing valid separators)

## 📁 Project Structure

```
number-processor/
├── src/
│   ├── controllers/
│   │   └── app.controller.ts          # Main API controller
│   ├── services/
│   │   ├── phone-validator.service.ts # Phone validation logic
│   │   ├── file-parser.service.ts     # CSV/Excel parsing
│   │   └── file-processor.service.ts  # File processing orchestration
│   ├── app.module.ts                  # Root module
│   └── main.ts                        # Application entry point
├── public/
│   └── index.html                     # Web UI
├── uploads/                           # Temporary upload directory
├── temp/                              # Temporary processing directory
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## 🎨 Code Standards

### Naming Conventions

- **Functions & Methods**: camelCase (e.g., `validateAndSanitize()`)
- **Classes**: PascalCase (e.g., `PhoneValidatorService`)
- **Interfaces**: PascalCase with descriptive names (e.g., `PhoneValidationResult`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Comments

- JSDoc comments for all public methods
- Inline comments for complex logic
- Clear parameter and return type descriptions

### Example

```typescript
/**
 * Validates and sanitizes a phone number
 * @param phoneNumber - The phone number to validate
 * @returns PhoneValidationResult object with validation details
 */
validateAndSanitize(phoneNumber: string): PhoneValidationResult {
  // Implementation
}
```

## 🧪 Testing

Run tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm run test:cov
```

## � Publishing to NPM

This package is ready to be published to NPM. See the publishing guides:

- **Quick Guide**: [PUBLISH.md](PUBLISH.md) - Fast track to publishing
- **Detailed Guide**: [NPM_PUBLISHING_GUIDE.md](NPM_PUBLISHING_GUIDE.md) - Comprehensive instructions

### Quick Publish

```bash
pnpm login
pnpm publish --access public
```

Users can then install it:

```bash
pnpm add @numsy
```

## �🔒 Security Features

- File type validation (only CSV and Excel files)
- File size limits (10MB maximum)
- Automatic file cleanup after download
- Input sanitization for phone numbers
- Secure file handling with unique filenames

## 📊 Sample Data Format

### Input CSV/Excel Format

```csv
name,phone,address
John Doe,9876543210,Mumbai
Jane Smith,98765-43210,Delhi
Bob Wilson,+91 9876543210,Bangalore
```

### Output Format

**valid_numbers.csv:**

```csv
name,phone,address,originalPhone,sanitizedPhone,validationStatus
John Doe,9876543210,Mumbai,9876543210,9876543210,Valid
```

**invalid_numbers.csv:**

```csv
name,phone,address,originalPhone,sanitizedPhone,validationStatus,validationReason
Invalid User,12345,Chennai,12345,12345,Invalid,Invalid format - must be 10 digits
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

Your Name

## 🐛 Known Issues

- None currently reported

## 🚀 Future Enhancements

- [ ] Support for multiple country phone formats
- [ ] Bulk processing with progress tracking
- [ ] Advanced filtering and sorting options
- [ ] User authentication and file history
- [ ] API rate limiting
- [ ] Docker containerization
- [ ] Unit and E2E test coverage

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Made with ❤️ using NestJS and TypeScript
