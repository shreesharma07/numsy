# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

We take the security of Numsy seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- ❌ Open a public GitHub issue
- ❌ Disclose the vulnerability publicly before it has been addressed
- ❌ Exploit the vulnerability beyond what is necessary to demonstrate the issue

### Please Do

✅ Email your findings to: **<security@numsy.dev>** (or create a private security advisory on GitHub)

✅ Include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability
- Suggested fix (if available)

## 📧 Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Release**: ASAP (typically within 14 days for critical issues)

## 🛡️ Security Measures

### Automated Security Scanning

We use the following tools to continuously monitor for vulnerabilities:

1. **Snyk**: Automated dependency vulnerability scanning
2. **npm audit**: Regular dependency audits
3. **CodeQL**: Static code analysis
4. **GitHub Dependabot**: Automatic security updates

### CI/CD Security Checks

Every pull request and commit goes through:

- Dependency vulnerability scanning
- Static code analysis
- Security-focused linting rules
- Automated security tests

### Dependency Management

- Dependencies are regularly updated
- Only trusted and well-maintained packages are used
- Minimal dependency footprint
- Regular security audits

## 🔐 Security Best Practices for Users

### 1. Keep Dependencies Updated

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Fix vulnerabilities automatically
pnpm audit --fix
```

### 2. Use LTS Node.js Versions

Always use LTS (Long Term Support) versions of Node.js:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. Validate Input Data

Always validate and sanitize input data before processing:

```typescript
import Numsy from 'numsy';

const numsy = new Numsy({
  throwOnError: true, // Enable strict error handling
  enableLogging: true, // Log suspicious activity
});

// Validate before processing
if (numsy.isValid(phoneNumber)) {
  const result = numsy.validate(phoneNumber);
}
```

### 4. Use Environment Variables

Never hardcode sensitive information:

```typescript
// ❌ Bad
const config = { apiKey: 'secret-key-123' };

// ✅ Good
const config = { apiKey: process.env.API_KEY };
```

### 5. Enable Error Handling

```typescript
const numsy = new Numsy({
  throwOnError: true,
  enableLogging: true,
  logLevel: 'error',
});

try {
  const result = numsy.processFile('input.csv');
} catch (error) {
  console.error('Processing error:', error);
  // Handle error appropriately
}
```

## 🐛 Known Security Considerations

### File Upload Handling

When processing uploaded files:

```typescript
// Validate file type
const allowedTypes = ['.csv', '.xlsx'];
const fileExt = path.extname(filePath);

if (!allowedTypes.includes(fileExt)) {
  throw new Error('Invalid file type');
}

// Validate file size (e.g., max 10MB)
const stats = fs.statSync(filePath);
if (stats.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}

// Process with validation
const parser = new Parser({
  throwOnError: true,
  maxRows: 10000, // Prevent memory exhaustion
});
```

### Data Sanitization

All phone numbers are sanitized to prevent injection attacks:

```typescript
// Removes all non-numeric characters except '+'
const sanitized = numsy.sanitize('+91-9876-543-210');
// Output: '+919876543210'
```

## 📊 Security Audit History

| Date       | Type                   | Severity | Status       | Fix Version |
| ---------- | ---------------------- | -------- | ------------ | ----------- |
| 2026-03-06 | Initial Security Setup | N/A      | ✅ Completed | 1.0.0       |

## 🔄 Security Update Policy

### Patch Releases (1.0.x)

- Critical security fixes
- Dependency updates with security patches
- Released as soon as possible

### Minor Releases (1.x.0)

- Non-critical security improvements
- Security feature additions
- Released on regular schedule

### Major Releases (x.0.0)

- Breaking security changes
- Major security architecture updates
- Planned and announced in advance

## 📚 Security Resources

### Internal Documentation

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Git Flow & Branch Protection](./docs/GIT_FLOW.md)

### External Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [Snyk Security Database](https://snyk.io/vuln/)

## 🏆 Security Hall of Fame

We recognize and thank security researchers who responsibly disclose vulnerabilities:

<!-- Names will be added here with permission -->

## 📞 Contact

- **Security Email**: <security@numsy.dev>
- **GitHub Security Advisories**: [Create Advisory](https://github.com/shreesharma07/numsy/security/advisories/new)
- **General Support**: [GitHub Issues](https://github.com/shreesharma07/numsy/issues)

## ⚖️ Disclosure Policy

We follow a **Coordinated Disclosure** approach:

1. **Report received** → Acknowledgment within 48 hours
2. **Validation** → Reproduce and validate the issue
3. **Fix development** → Create and test the fix
4. **Release** → Deploy the fix in a patch release
5. **Public disclosure** → After the fix is released
6. **Credit** → Public acknowledgment of the reporter (if desired)

---

**Last Updated**: March 6, 2026  
**Version**: 1.0.0
