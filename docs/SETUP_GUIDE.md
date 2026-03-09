# 🚀 Complete Setup & Configuration Guide

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Development Environment](#development-environment)
3. [CI/CD Configuration](#cicd-configuration)
4. [Security Setup](#security-setup)
5. [Git Flow Implementation](#git-flow-implementation)
6. [Testing Strategy](#testing-strategy)
7. [Deployment](#deployment)

---

## Initial Setup

### Prerequisites

```bash
# Required software
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git >= 2.0.0

# Optional but recommended
- VS Code or similar IDE
- GitHub CLI (gh)
```

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/shreesharma07/numsy.git
cd numsy
```

#### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# This will:
- Install all dependencies
- Setup Husky git hooks
- Prepare the development environment
```

#### 3. Setup Git Hooks

```bash
# Husky hooks are automatically installed via `pnpm install`
# Verify installation
ls -la .husky/
```

#### 4. Environment Variables

Create a `.env` file in the root:

```bash
# Server configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug
ENABLE_LOGGING=true

# Security (optional)
SNYK_TOKEN=your_snyk_token_here
NPM_TOKEN=your_npm_token_here
```

---

## Development Environment

### Available Scripts

```bash
# Development
pnpm run dev                  # Start with nodemon (auto-reload)
pnpm run dev:server           # Start NestJS server with watch
pnpm run serve                # Start CLI server with port auto-assignment
pnpm run serve --port 3000    # Start server on specific port
pnpm run serve --page         # Serve HTML utility page

# Building
pnpm run build                # Build package with SWC + TypeScript declarations
pnpm run build:nest           # Build NestJS application

# Code Quality
pnpm run lint                 # Run ESLint and auto-fix
pnpm run lint:check           # Check linting without fixing
pnpm run format               # Format code with Prettier
pnpm run format:check         # Check formatting
pnpm run type-check           # Run TypeScript compiler check

# Testing
pnpm test                     # Run all tests
pnpm test:watch               # Watch mode
pnpm test:cov                 # Generate coverage report
pnpm test:e2e                 # End-to-end tests
pnpm test:debug               # Debug tests

# Security
pnpm run audit:check          # Check for vulnerabilities
pnpm run audit:fix            # Auto-fix vulnerabilities
pnpm run snyk:test            # Snyk vulnerability scan
pnpm run snyk:monitor         # Monitor project with Snyk
pnpm run security:check       # Run all security checks

# CI/CD
pnpm run validate             # Run lint + type-check + test
pnpm run ci                   # Full CI pipeline locally
```

### IDE Configuration

#### VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true,
    "**/coverage": true
  }
}
```

#### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript
- Jest
- GitLens
- GitHub Pull Requests

---

## CI/CD Configuration

### GitHub Actions Setup

#### 1. CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push to feature branches and PRs:

```yaml
- Code quality checks (lint, format, type-check)
- Security scan with Snyk
- Test suite (multi-OS, multi-Node version)
- Build package
- Dependency review
```

#### 2. Security Monitoring (`.github/workflows/security.yml`)

Runs daily and on-demand:

```yaml
- Snyk security scan
- CodeQL analysis
- NPM audit
- Auto-create issues for vulnerabilities
```

#### 3. Release Pipeline (`.github/workflows/release.yml`)

Runs on version tags (v\*):

```yaml
- Validate release
- Run full test suite
- Build package
- Publish to NPM
- Create GitHub release
```

### Required GitHub Secrets

Add these in GitHub repository settings → Secrets:

```bash
NPM_TOKEN          # NPM authentication token
SNYK_TOKEN         # Snyk API token
CODECOV_TOKEN      # Codecov upload token (optional)
```

#### How to Get Tokens

**NPM Token:**

```bash
npm login
npm token create
```

**Snyk Token:**

1. Sign up at <https://snyk.io>
2. Go to Account Settings → API Token
3. Copy the token

### Setting Up Branch Protection

```bash
# Using GitHub CLI
gh api repos/shreesharma07/numsy/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["Code Quality Checks","Test Suite"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1}'
```

Or manually via GitHub UI:

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable required status checks
4. Require pull request reviews

---

## Security Setup

### 1. Install Snyk CLI

```bash
# Install globally
npm install -g snyk

# Authenticate
snyk auth

# Test project
snyk test

# Monitor project
snyk monitor
```

### 2. Configure Snyk

Update `.snyk` file with your organization:

```yaml
org: your-snyk-org-name
```

### 3. Enable GitHub Security Features

In repository settings:

- ✅ Enable dependency graph
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates
- ✅ Enable code scanning (CodeQL)
- ✅ Enable secret scanning

### 4. Pre-commit Security Checks

Husky automatically runs these before each commit:

```bash
- Lint staged files
- Run related tests
- Format code
```

---

## Git Flow Implementation

### Branch Naming Conventions

```bash
feature/add-new-feature
bugfix/fix-validation-bug
hotfix/critical-security-fix
release/v1.2.0
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
type(scope): subject

body

footer
```

**Examples:**

```bash
feat: add batch processing API
fix: resolve CSV parsing error
docs: update installation guide
chore: bump dependencies
ci: add security workflow
```

### Workflow Example

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Make changes
# ... code changes ...

# 3. Commit (Husky will validate)
git add .
git commit -m "feat: add my feature"

# 4. Push
git push origin feature/my-feature

# 5. Create Pull Request
gh pr create --base develop --title "feat: add my feature"

# 6. After merge, cleanup
git branch -d feature/my-feature
```

---

## Testing Strategy

### Test Structure

```
test/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/          # Test data
```

### Writing Tests

```typescript
import { PhoneValidator } from '../src/core/PhoneValidator';

describe('PhoneValidator', () => {
  let validator: PhoneValidator;

  beforeEach(() => {
    validator = new PhoneValidator();
  });

  describe('validate', () => {
    it('should validate Indian mobile numbers', () => {
      const result = validator.validate('9876543210');
      expect(result.isValid).toBe(true);
    });
  });
});
```

### Test Coverage Goals

- **Overall**: > 80%
- **Statements**: > 85%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 85%

### Running Tests

```bash
# All tests
pnpm test

# With coverage
pnpm test:cov

# Watch mode (during development)
pnpm test:watch

# Specific file
pnpm test phone-validator.spec.ts
```

---

## Deployment

### NPM Publishing

#### Manual Publishing

```bash
# 1. Update version
npm version patch  # or minor, major

# 2. Build
pnpm run build

# 3. Test build
node dist/index.js

# 4. Publish
npm publish --access public
```

#### Automated Publishing (Recommended)

```bash
# 1. Create and push a version tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# GitHub Actions will automatically:
# - Run tests
# - Build package
# - Publish to NPM
# - Create GitHub release
```

### Server Deployment

#### Using CLI

```bash
# Install globally
npm install -g numsy

# Start server
numsy-serve --port 8080 --page

# Or use npx
npx numsy serve --port 8080
```

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/cli/server.js --name numsy-server

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
COPY public ./public
EXPOSE 3000
CMD ["node", "dist/cli/server.js"]
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check server health
curl http://localhost:3000/api/health

# Check package version
npm view numsy version
```

### Regular Maintenance Tasks

**Weekly:**

- Review Dependabot PRs
- Check Snyk security alerts
- Review open issues

**Monthly:**

- Update dependencies
- Review test coverage
- Update documentation
- Check performance metrics

**Quarterly:**

- Major dependency updates
- Security audit
- Performance review
- Documentation overhaul

---

## Troubleshooting

### Common Issues

#### Husky hooks not working

```bash
# Reinstall hooks
pnpm run prepare
chmod +x .husky/*
```

#### Build failures

```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm run build
```

#### Test failures

```bash
# Clear Jest cache
pnpm test --clearCache

# Run with verbose output
pnpm test --verbose
```

#### Port already in use

```bash
# Use automatic port assignment
pnpm run serve
# Server will automatically find an available port
```

---

## Additional Resources

- [Contributing Guidelines](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)
- [Git Flow Guide](./GIT_FLOW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Usage Examples](./USAGE_EXAMPLES.md)

---

## Support

- **GitHub Issues**: <https://github.com/shreesharma07/numsy/issues>
- **Discussions**: <https://github.com/shreesharma07/numsy/discussions>
- **Email**: <support@numsy.dev>

---

**Last Updated**: March 6, 2026  
**Version**: 1.0.0
