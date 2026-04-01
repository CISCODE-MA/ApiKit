# Frontend Package Creation Instructions

## Overview

This template creates production-ready React TypeScript npm packages with complete CI/CD, testing, and code quality enforcement.

---

## When Using This Template - CHANGES REQUIRED

### 1. **package.json** - Update These Fields

```json
{
  "name": "@ciscode/ui-YOUR_PACKAGE_NAME",
  "version": "0.0.0",
  "description": "YOUR_PACKAGE_DESCRIPTION",
  "repository": {
    "url": "https://github.com/CISCODE-MA/YOUR_REPO_NAME.git"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

### 2. **.github/workflows/release-check.yml** - Update SonarCloud Project Key

```yaml
env:
  SONAR_PROJECT_KEY: 'CISCODE-MA_YOUR_REPO_NAME'
```

### 3. **Replace Example Files** in `src/`

- Create your React components in `src/components/`
- Create custom hooks in `src/hooks/`
- Create utilities in `src/utils/`
- Update `src/index.ts` with your public API exports

### 4. **Update Documentation**

- `README.md` - Add your package description, features, and usage examples
- `CONTRIBUTING.md` - Already complete (component guidelines included)
- `CODE_OF_CONDUCT` - Already complete
- `SECURITY` - Already complete

### 5. **Set Up Environment**

- Copy `.env.example` to `.env` (if needed for dev)

### 6. **Tailwind/Postcss** (if using styling)

- Configure `tailwind.config.js` if needed
- Update `postcss.config.cjs` if needed

---

## Architecture Pattern

```
src/
├── index.ts                          # Public API exports (components, hooks, utils)
├── components/                       # React components
│   ├── Button/
│   │   ├── Button.tsx               # Component
│   │   ├── Button.test.tsx          # Unit tests
│   │   └── index.ts                 # Export
│   └── ...
├── hooks/                           # Custom React hooks
│   ├── useCustom.ts
│   ├── useCustom.test.ts
│   └── ...
├── utils/                           # Utility functions
│   ├── helpers.ts
│   ├── helpers.test.ts
│   └── ...
├── types/                           # TypeScript types/interfaces
└── styles/                          # Global styles (if applicable)
```

**Component Guidelines:**

- Functional components only (React hooks)
- Props typed with TypeScript
- Accessibility first (WCAG 2.1 AA)
- Testable with React Testing Library
- JSDoc comments for public APIs

---

## npm Scripts (Pre-configured)

### Development

```bash
pnpm run build           # Build library
pnpm run dev            # Watch mode (rebuild on change)
```

### Quality Gates

```bash
pnpm run lint           # Check code with ESLint
pnpm run lint:fix       # Autofix lint issues
pnpm run format         # Check formatting
pnpm run format:write   # Format all files
pnpm run typecheck      # TypeScript type checking
```

### Testing

```bash
pnpm run test           # Run unit tests
pnpm run test:watch     # Watch mode
pnpm run test:cov       # With coverage report
```

### Automation

```bash
pnpm run verify         # Full validation: lint + typecheck + test:cov
pnpm run prepublishOnly # Auto-runs on npm publish
```

---

## CI/CD Workflows (Automatic)

### 1. **PR Validation** (on every PR to develop)

- Runs: `pnpm run lint` + `pnpm run typecheck` + `pnpm run test` + `pnpm run build`
- Blocks merge if any check fails

### 2. **Release Check** (on PR to master)

- Full validation + coverage + SonarCloud analysis (optional)
- Verifies production readiness

### 3. **Publish** (on master branch with version tag)

- Auto-runs on `git tag v*.*.* && git push origin master --tags`
- Publishes to NPM with provenance

---

## Release & Publishing

### Versioning (Semantic)

Uses `changesets` for semantic versioning:

```bash
pnpm run changeset        # Create changeset
pnpm run version-packages # Update versions
pnpm run release          # Publish (CI will handle this)
```

### To Publish

1. Merge features to `develop` with changesets
2. When ready, create PR to `master`
3. Tag: `git tag v1.0.0 && git push origin master --tags`
4. CI automatically publishes to NPM

---

## Key Dependencies

### Production

- `react` - React library (peer dependency)
- `react-dom` - React DOM (peer dependency)

### Peer Dependencies (in projects using this kit)

- React 18+
- React DOM 18+

### Dev Dependencies

- **Testing**: Vitest + React Testing Library + jsdom
- **Linting**: ESLint + @typescript-eslint + prettier
- **Formatting**: Prettier
- **TypeScript**: Strict mode
- **Build**: tsup (TypeScript bundler)
- **Git Hooks**: Husky + lint-staged
- **Publishing**: semantic-release + changesets

---

## Git Hooks (Automated)

### Pre-commit

- Runs lint-staged: `prettier --write` + `eslint --fix`
- Prevents commits with formatting/lint issues

### Pre-push

- Runs `pnpm run typecheck` + `pnpm run test`
- Prevents pushing broken code

---

## Configuration Files Reference

| File                    | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `tsconfig.json`         | TypeScript compilation settings                |
| `tsconfig.build.json`   | Build-specific settings                        |
| `tsconfig.eslint.json`  | ESLint-specific settings                       |
| `vitest.config.ts`      | Vitest test runner config                      |
| `vitest.setup.ts`       | Test environment setup (React Testing Library) |
| `eslint.config.js`      | ESLint rules (flat config format)              |
| `.prettierrc.json`      | Prettier formatting rules                      |
| `.editorconfig`         | Editor settings (cross-IDE)                    |
| `.npmrc`                | NPM behavior (strict engines)                  |
| `.npmignore`            | Exclude from published package                 |
| `.env.example`          | Environment template                           |
| `tsup.config.ts`        | Build bundler configuration                    |
| `.husky/`               | Git hooks setup                                |
| `lint-staged.config.js` | Pre-commit tasks                               |

---

## Testing Guidelines

### Test File Naming

- `src/components/Button/Button.test.tsx` - Component tests
- `src/hooks/useCustom.test.ts` - Hook tests
- `src/utils/helpers.test.ts` - Utility tests

### Test Setup (Automatic)

- jsdom environment (browser-like)
- React Testing Library integration
- Coverage collection enabled

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

---

## Package Exports

The main export file should be `src/index.ts`:

```typescript
// Export components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

// Export hooks
export { useCustomHook } from './hooks/useCustomHook';

// Export utilities
export { helperFunction } from './utils/helpers';

// Export types
export type { CustomType } from './types';
```

---

## Build Output

The package exports in three formats:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs", // ES Modules
      "require": "./dist/index.cjs" // CommonJS
    }
  }
}
```

---

## SonarCloud Setup (Optional)

If using SonarCloud for code quality:

1. **Repository secret** - Add `SONAR_TOKEN` to GitHub
2. **Trigger** - Manually in Actions tab or via workflow_dispatch
3. **Project Key** - Already configured in `.github/workflows/release-check.yml`

---

## Common Commands for Development

```bash
# Initial setup
git clone <repo> && cd <repo> && pnpm install

# Development
pnpm run build           # Build once
pnpm run dev            # Build on file change

# Quality assurance
pnpm run verify          # Full validation

# Testing
pnpm run test:cov       # Coverage report

# Preparing release
pnpm run changeset      # Document changes
pnpm run version-packages  # Update package.json
```

---

## Accessibility Best Practices

- Use semantic HTML elements
- Include ARIA labels where needed
- Test with keyboard navigation
- Test with screen readers
- Use `@testing-library/jest-dom` for accessibility matchers

---

## Support

- **Documentation** → README.md, CONTRIBUTING.md
- **Issues** → GitHub Issues
- **Security** → See SECURITY file
