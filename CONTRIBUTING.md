# Contributing to 🔢 Numsy

Thank you for your interest in contributing to 🔢 Numsy! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear description of the enhancement
- Why this enhancement would be useful
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository**

   ```bash
   git clone https://github.com/yourusername/number-processor.git
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Use camelCase for function names
   - Add JSDoc comments for all public methods
   - Write tests for new functionality

4. **Test your changes**

   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

5. **Commit your changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all tests pass

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run start:dev
   ```

3. Run tests:

   ```bash
   npm test
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all code
- Define interfaces for all data structures
- Use strict type checking
- Avoid `any` types when possible

### Naming Conventions

- **Files**: kebab-case (e.g., `phone-validator.service.ts`)
- **Classes**: PascalCase (e.g., `PhoneValidatorService`)
- **Functions/Methods**: camelCase (e.g., `validateAndSanitize`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Interfaces**: PascalCase (e.g., `PhoneValidationResult`)

### Documentation

- Add JSDoc comments to all public methods
- Include parameter descriptions and return types
- Add inline comments for complex logic

Example:

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

### Testing

- Write unit tests for all services
- Write E2E tests for API endpoints
- Aim for high code coverage
- Test both success and error cases

## Project Structure

```
src/
├── controllers/     # API controllers
├── services/        # Business logic services
├── app.module.ts    # Root module
└── main.ts          # Entry point
```

## Questions?

Feel free to open an issue for any questions or concerns.

Thank you for contributing! 🎉
