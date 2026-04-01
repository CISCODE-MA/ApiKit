# Contributing to <PACKAGE_NAME>

Thank you for your interest in contributing to **<PACKAGE_NAME>** 💙  
Contributions of all kinds are welcome: bug fixes, improvements, documentation, and discussions.

---

## Project Philosophy

This package follows these principles:

- Be reusable across multiple React applications
- Expose a clear and stable public API
- Keep components focused and testable
- Avoid unnecessary dependencies or vendor lock-in
- Favor correctness, accessibility, and clarity over shortcuts

Please keep these principles in mind when contributing.

---

## Getting Started

### Development Setup

```bash
# Clone the repository
git clone https://github.com/CISCODE-MA/<REPO_NAME>.git
cd <REPO_NAME>

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
```

### Common Commands

```bash
# Build the project
pnpm run build

# Start development (watch mode)
pnpm run dev

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Check code quality
pnpm run verify          # Lint + typecheck + tests

# Fix lint issues
pnpm run lint:fix

# Format code
pnpm run format:write
```

---

## Pull Request Process

1. **Fork the repository** and create your feature branch (`git checkout -b feature/amazing-feature`)
2. **Make your changes** and ensure they follow the project patterns
3. **Run `pnpm run verify`** to check lint, types, and tests
4. **Commit with meaningful messages** (we use conventional commits)
5. **Push to your fork** and open a Pull Request

---

## Code Style

We use:

- **ESLint** for linting with flat config format
- **Prettier** for code formatting
- **TypeScript** with strict mode enabled
- **Vitest** for unit tests with React Testing Library

All code is auto-formatted on commit via husky hooks.

---

## Component Guidelines

- **Functional components only** - Use React hooks
- **Props validation** - Use TypeScript for type safety
- **Accessibility first** - WCAG 2.1 AA compliance
- **Testability** - Write components that are easy to test
- **Documentation** - JSDoc comments for public APIs

---

## Testing

- Write tests for new components and utilities
- Coverage targets: 80%+ for new code
- Test files: `src/**/*.test.ts` or `src/**/*.test.tsx`

```bash
pnpm run test:cov          # Run with coverage report
```

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example:**

```
feat(button): add loading state support

This adds a loading state to the Button component with a spinner.
Closes #123
```

---

## Issues & Discussions

- **Bug reports**: Use GitHub Issues with reproduction steps
- **Feature requests**: Discuss first in Discussions or Issues
- **Questions**: Ask in GitHub Discussions

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Questions? Feel free to open an issue or contact the maintainers. Thanks for contributing! 🙏
