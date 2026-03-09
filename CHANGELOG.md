# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.1.0](https://github.com/shreesharma07/numsy/compare/v1.0.0...v1.1.0) (2026-03-09)

### ✨ Features

- enhance server startup logging and configuration ([942063e](https://github.com/shreesharma07/numsy/commit/942063e66b810f929580a4b8c52fae7b09931da1))
- **files,api:** add automatic file cleanup service and improve file handling security ([ce3a21b](https://github.com/shreesharma07/numsy/commit/ce3a21b99271bb8bd72b4b7c71bc9345b66c5ccd))
- Increase maximum file size limit to 50MB and update related configurations ([fc08268](https://github.com/shreesharma07/numsy/commit/fc0826881abcde682de41371270b30891d2af862))

### 🐛 Bug Fixes

- **ui:** adjust panel height and remove outdated file processing feature ([cdde31a](https://github.com/shreesharma07/numsy/commit/cdde31a1ac22cd4fc527cfc107e205c730e86feb))

## 1.0.0 (2026-03-09)

### ✨ Features

- add comprehensive name field variations and enhance phone validation ([da3ade4](https://github.com/shreesharma07/numsy/commit/da3ade4c0eb20ce635cea161b5fc9a9add48c7b9))
- add display name to package.json for better visibility ([2e06bad](https://github.com/shreesharma07/numsy/commit/2e06bad49a08c900ca4c3af758435c621eba0698))
- add pnpm overrides for dependency version management ([e39346d](https://github.com/shreesharma07/numsy/commit/e39346d5f6d3c0b6b0a812c6ac2a59762ca65163))
- add release preview script for local testing ([18729c7](https://github.com/shreesharma07/numsy/commit/18729c7c1d0c008ebc7ae46e96329aedbd7674a2))
- add utility functions for file operations and enhance file processing ([ba9c903](https://github.com/shreesharma07/numsy/commit/ba9c903592bbcf5c0056268f9f3d8ad91e024e08))
- add Vite configuration with Codecov plugin for bundle analysis ([2be29c7](https://github.com/shreesharma07/numsy/commit/2be29c7d8a38e6823874e7e806d8ef911360fa8a))
- consolidate CI workflows into main.yml and enhance pre-push validation checks ([44a953b](https://github.com/shreesharma07/numsy/commit/44a953ba4d01ba3e86ea54ab35db9e400a7a8693))
- **docs:** Add comprehensive implementation and quick start guides for Numsy package ([d05ad2c](https://github.com/shreesharma07/numsy/commit/d05ad2c257c1b4fe42c48af30dd73027ba1ca84a))
- enable CI/CD automation ([e5e1732](https://github.com/shreesharma07/numsy/commit/e5e1732bc51a20c9313429ebd7c349a728597f2e))
- enhance file processing with path validation and security checks ([f0ed59e](https://github.com/shreesharma07/numsy/commit/f0ed59ef46f35a217bf200c907713979298cbcb0))
- enhance server CLI with command line argument parsing and help display ([8839b2a](https://github.com/shreesharma07/numsy/commit/8839b2aaa1bd683451f5eb8b3c9f640708d9baf4))
- implement automated NPM cooldown handling and enhance version bumping scripts ([ee96cdb](https://github.com/shreesharma07/numsy/commit/ee96cdbe70a157789e7b2931d31aed57df74df34))
- implement semantic-release for automated versioning and publishing ([99ff93d](https://github.com/shreesharma07/numsy/commit/99ff93d66eb5eb72a8d43f0591c3d3f9e54c5c8d))
- rebrand Number Processor to 🔢 Numsy across documentation and codebase ([26a73fc](https://github.com/shreesharma07/numsy/commit/26a73fc1a19b66e0ca7e17cc6b1c5dbabce29c76))
- rename project to "Numsy" and update README ([15cf7c0](https://github.com/shreesharma07/numsy/commit/15cf7c0add16b3cf4062111902cce7778209fee4))
- update .gitignore to include additional codecov files and checksum ([183a40b](https://github.com/shreesharma07/numsy/commit/183a40b57827e4d38749e542d1e295928c795b57))
- update dependencies for semantic-release and NestJS integration ([fe09066](https://github.com/shreesharma07/numsy/commit/fe0906631bf115a08ca054ccb7f340028d73a905))
- update output file naming conventions and enhance ZIP file creation in FileProcessor ([8396f90](https://github.com/shreesharma07/numsy/commit/8396f9089ea39270b74fbe69363403cc7dfdd7de))
- update package name for better organization ([2d291c5](https://github.com/shreesharma07/numsy/commit/2d291c5368af79d8d800f5187d74704f21cba057))
- update package name to include scope for better organization ([1797c03](https://github.com/shreesharma07/numsy/commit/1797c03bee2fd912a15fd52b02e2804d047fc395))
- update semantic-release workflow and add GitHub Secrets configuration guide ([b7e49ac](https://github.com/shreesharma07/numsy/commit/b7e49acb63f1c671983a9f8f4517fca84dbc645d))

### 🐛 Bug Fixes

- correct indentation in CI workflow documentation for clarity ([ef3f487](https://github.com/shreesharma07/numsy/commit/ef3f4874ff75fdc1fb8221ba461aa0972b7eded4))
- **docs:** Update paths and package names in documentation for consistency ([357edf0](https://github.com/shreesharma07/numsy/commit/357edf075a4f3973b325234d50d7cd6ad86d94a2))
- enhance email validation regex and improve file cleanup logic ([1379f3d](https://github.com/shreesharma07/numsy/commit/1379f3d2cfa3f59c2e23d56d031fd71b8ef0f95f))
- enhance security by sanitizing inputs and preventing XSS attacks ([9570e87](https://github.com/shreesharma07/numsy/commit/9570e87a87cedf01ee60eca4e84cc641c279c321))
- enhance security by validating file paths to prevent path traversal vulnerabilities ([b63627a](https://github.com/shreesharma07/numsy/commit/b63627a677e438754f8cf1c6b9344477b822da7e))
- enhance security for download endpoint by sanitizing ID and preventing path traversal ([1fdfd69](https://github.com/shreesharma07/numsy/commit/1fdfd69bdd3c19e89fa17105fde2a4f7969cabbe))
- resolve ESLint configuration for test files ([6e0851b](https://github.com/shreesharma07/numsy/commit/6e0851bf575881eb0c4dd38e037cf6508234aedf))
- resolve semantic-release CI issues ([5079f27](https://github.com/shreesharma07/numsy/commit/5079f27b8523cbd769be852bc032168ab514d768))
- standardize quotes and enhance Snyk commands in CI workflows ([dc2f88d](https://github.com/shreesharma07/numsy/commit/dc2f88d094d8360e6265737632d916c9f8dd515e))
- streamline e2e test setup by removing redundant afterAll hook ([189344e](https://github.com/shreesharma07/numsy/commit/189344e32a480dc55b594bc795990ffa28647e20))
- update CI and security workflows for branch consistency and formatting ([f0d5074](https://github.com/shreesharma07/numsy/commit/f0d50744ff3838d691007c7768d569b1b45adfee))
- update repository URLs in package.json for consistency ([9953c0b](https://github.com/shreesharma07/numsy/commit/9953c0bc0b652dc215093654e59041e7d00228ae))

### ♻️ Code Refactoring

- code structure for improved readability and maintainability ([96731ea](https://github.com/shreesharma07/numsy/commit/96731ea402a0a77161db97378fd5dbe0a5d58aba))
- replace XLSX with ExcelJS for Excel file parsing ([91d9e50](https://github.com/shreesharma07/numsy/commit/91d9e50adbdd3b2f817ddd1a09a685bfa002f0a4))

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
