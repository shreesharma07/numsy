# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup

## [1.0.0] - 2026-03-06

### Added
- Phone number validation for Indian mobile numbers (10-digit)
- CSV file parsing support
- Excel file parsing support (.xlsx, .xls)
- Smart phone column detection algorithm
- Automatic phone number sanitization (remove spaces, hyphens, country codes)
- Web interface with drag-and-drop functionality
- ZIP file generation for processed results
- Separate valid and invalid number categorization
- Automatic file cleanup after download
- RESTful API endpoints for file processing
- Comprehensive validation rules:
  - Numbers must start with 6, 7, 8, or 9
  - Must be exactly 10 digits
  - Rejects invalid patterns
- Support for fields: name, phone, address
- Real-time processing status display
- Statistics summary (total/valid/invalid counts)
- Unit tests for phone validator service
- E2E tests for API endpoints
- Comprehensive documentation (README, QUICKSTART, etc.)
- MIT License

### Technical Stack
- NestJS framework v10.3.0
- TypeScript v5.3.3
- Node.js >=16.0.0
- pnpm package manager
- csv-parser for CSV processing
- xlsx for Excel processing
- archiver for ZIP creation
- multer for file uploads

[Unreleased]: https://github.com/your-username/number-processor/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/number-processor/releases/tag/v1.0.0
