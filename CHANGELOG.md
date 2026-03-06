# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0] - 2026-03-06

### ✨ Features

#### Core Package

- Complete refactoring into professional npm package "numsy"
- Class-based architecture with Numsy, Parser, PhoneValidator, FileProcessor
- Modular structure with common folder (interfaces, functions, helpers)
- Multiple import styles (default, named, path-based exports)

#### Phone Number Processing

- Phone number validation for Indian mobile numbers (10-digit starting with 6-9)
- Smart phone column detection algorithm
- Automatic phone number sanitization (remove spaces, hyphens, country codes)
- Batch validation support
- Multiple number extraction from text

#### File Processing

- CSV file parsing support with automatic encoding detection
- Excel file parsing (.xlsx, .xls) support
- ZIP file generation for processed results
- Separate valid and invalid number categorization
- Real-time processing status display

#### Developer Experience

- SWC integration for fast compilation (~100ms for 24 files)
- Nodemon support for auto-reload development
- CLI server with dynamic port assignment (--port, --page options)
- Enhanced type system with comprehensive enums and utility types

### 🔒 Security

- Snyk integration for automated vulnerability scanning
- CodeQL static code analysis in CI/CD
- Pre-commit hooks for automated security checks
- Dependency audits automated in CI pipeline
- Branch protection enforced on main and develop branches
- Security policy and vulnerability reporting process

### 🚀 CI/CD

- Comprehensive CI pipeline (lint, test, build, security scan)
- Security monitoring with daily automated scans
- **Semantic release** for automated versioning and changelog generation
- Multi-platform testing (Ubuntu, Windows × Node 18, 20)
- Code coverage reporting with Codecov integration
- Automated NPM publishing on release

### 📚 Documentation

- Git Flow guide with complete branching strategy
- Release management guide with semantic-release
- Setup guide with comprehensive environment setup
- Security policy with vulnerability reporting
- Structured pull request template
- Code of Conduct for community guidelines
- API documentation with usage examples

### 🛠️ Development Tools

- Husky pre-commit, pre-push, and commit-msg hooks
- Lint-staged for efficient staged file linting
- Commitlint for conventional commit validation
- Prettier for code formatting
- ESLint with TypeScript rules
- Semantic-release for automated releases

### 🐛 Bug Fixes

- Fixed TypeScript nullable type issues in phone validator
- Resolved optional chaining errors in file parser
- Added `*.tsbuildinfo` to .gitignore for build cache cleanup

### ⚡ Performance

- SWC compiler provides 20x faster builds compared to tsc
- Test parallelization with multi-worker execution
- Smart caching with pnpm store and GitHub Actions

### 📦 Package Configuration

- NPM-ready with proper exports and .npmignore
- Full TypeScript declarations included
- CommonJS and ESM format support
- Repository URL: <https://github.com/shreesharma07/numsy>

### Testing

- Unit tests for all core services
- E2E tests for API endpoints
- Jest v29.7.0 test framework
- 42 passing tests with >80% coverage target

---

## Pre-1.0.0

Initial development phase before standardized releases. All features were developed and stabilized for the 1.0.0 release.
