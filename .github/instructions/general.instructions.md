# General Instructions - React Component Library

> **Last Updated**: February 2026

---

## 📦 Package Overview

### What is this package?

This is a production-ready React component library providing reusable UI components for modern web applications.

**Type**: React Component Library  
**Framework**: React 18+, TypeScript 5+  
**Build**: Vite / tsup  
**Package Manager**: pnpm 9.15.0  
**Testing**: Vitest + React Testing Library  
**Distribution**: NPM package  
**License**: MIT

### Key Characteristics

| Characteristic    | Description                                  |
| ----------------- | -------------------------------------------- |
| **Architecture**  | Component-based, hooks-first, composable     |
| **Styling**       | CSS Modules / Tailwind - fully customizable  |
| **TypeScript**    | Fully typed, strict mode enabled             |
| **Accessibility** | WCAG 2.1 AA compliant                        |
| **Testing**       | Unit + component tests, target 80%+ coverage |

---

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER                  │
│  ┌──────────────────────────────────┐   │
│  │    React Components              │   │
│  │    - UI Logic                    │   │
│  │    - Event Handling              │   │
│  │    - Accessibility               │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         HOOKS LAYER                     │
│  ┌──────────────────────────────────┐   │
│  │    Custom React Hooks            │   │
│  │    - State Management            │   │
│  │    - Side Effects                │   │
│  │    - Context Integration         │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│        CONTEXT LAYER                    │
│  ┌──────────────────────────────────┐   │
│  │     Context Providers            │   │
│  │     - Theme                      │   │
│  │     - Global State               │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│          TYPES LAYER                    │
│  ┌──────────────────────────────────┐   │
│  │    TypeScript Interfaces         │   │
│  │    - Props Types                 │   │
│  │    - Custom Types                │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── components/        # React components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.module.css
│   │   ├── Button.types.ts
│   │   └── index.ts
│   ├── Modal/
│   ├── Form/
│   └── Input/
├── hooks/            # Custom hooks
│   ├── useModal.ts
│   ├── useModal.test.ts
│   ├── useForm.ts
│   └── useForm.test.ts
├── context/          # Context providers
│   ├── ThemeContext.tsx
│   └── FormContext.tsx
├── types/            # TypeScript types
│   └── common.types.ts
├── utils/            # Utilities
│   ├── classNameUtils.ts
│   └── styleUtils.ts
├── styles/           # Global styles
│   └── globals.css
└── index.ts          # Public API exports
```

---

## 📝 Coding Standards

### Component Patterns

```typescript
// ✅ Functional components with TypeScript
interface ButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
}: ButtonProps): JSX.Element {
  return (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  );
}

// ❌ Class components
class Button extends React.Component { }
```

### Prop Naming

```typescript
// ✅ Descriptive, semantic names
interface ButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

// ❌ Generic, unclear names
interface ButtonProps {
  handler: any;
  disabled: boolean;
  type: string;
  sz: string;
}
```

### TypeScript Strictness

```typescript
// ✅ Explicit types
const [count, setCount] = useState<number>(0);
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  setCount(count + 1);
};

// ❌ Implicit any
const [count, setCount] = useState();
const handleClick = (e) => {
  setCount(count + 1);
};
```

---

## 🎨 Styling Philosophy

### CSS Modules (Primary)

```typescript
import styles from './Button.module.css';

export function Button({ className }: ButtonProps) {
  return (
    <button className={`${styles.button} ${className || ''}`}>
      Click
    </button>
  );
}
```

**Advantages:**

- Scoped styles by default
- BEM convention support
- No naming conflicts
- Bundle only what's used

### Tailwind (Alternative)

```typescript
export function Button({ variant = 'primary' }: ButtonProps) {
  const classes = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return <button className={classes[variant]}>Click</button>;
}
```

**Advantages:**

- Utility-first approach
- Rapid development
- Consistent design system
- Small footprint with PurgeCSS

---

## 🔐 Security Standards

### Input Validation

```typescript
// ✅ GOOD: Validate user input
export function EmailInput() {
  const [email, setEmail] = useState('');
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      aria-invalid={!isValid}
    />
  );
}

// ❌ BAD: No validation
export function EmailInput() {
  const [email, setEmail] = useState('');
  return <input value={email} onChange={(e) => setEmail(e.target.value)} />;
}
```

### XSS Prevention

```typescript
// ✅ GOOD: React automatically escapes content
<div>{userContent}</div> {/* Safe */}

// ❌ BAD: Using dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

```typescript
// ✅ GOOD: Accessible button
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// ❌ BAD: Not accessible
<button onClick={handleClose}>X</button>
```

### Keyboard Navigation

```typescript
// ✅ GOOD: All interactive elements are keyboard accessible
<button onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
  Click me
</button>

// ❌ BAD: Only mouse events
<div onClick={handleClick}>Not accessible</div>
```

---

## 📖 Environment Configuration

### .env.example Template

```bash
# Application
VITE_APP_NAME=My App
VITE_APP_VERSION=1.0.0

# API
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_BETA_FEATURES=false

# Environment
MODE=development
```

---

## 📖 Development Workflow

### Initialization

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm run dev`
3. Run tests: `pnpm test`
4. Build: `pnpm run build`

### Typical Development Loop

```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/UI-MODULE-123

# 2. Develop components
# - Create component files
# - Write tests
# - Update documentation

# 3. Build & test
pnpm run build
pnpm run test:cov

# 4. Commit & push
git add .
git commit -m "feat: add new component"
git push origin feature/UI-MODULE-123

# 5. Create PR
gh pr create --base develop
```

---

## 🧪 Testing Requirements

### Coverage Targets

- **Components**: 80% coverage
- **Hooks**: 90% coverage
- **Overall**: 80%+ minimum

### Test Types

- **Unit Tests**: Component props and state in isolation
- **Component Tests**: User interactions and rendering
- **Accessibility Tests**: ARIA and keyboard navigation

---

## 📚 Documentation Requirements

All exported components must include:

- JSDoc comments with `@example`
- Type definitions for all props
- Usage examples
- Accessibility notes

````typescript
export interface ButtonProps {
  /** Button text or content */
  children: React.ReactNode;
  /** Click event handler */
  onClick?: () => void;
  /** Visual style variant */
  variant?: 'primary' | 'secondary';
}

/**
 * Reusable button component with multiple variants
 *
 * @accessibility
 * - Keyboard accessible (Enter/Space to activate)
 * - Screen reader friendly
 * - respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 * ```
 */
export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  // implementation
}
````

---

## ✅ Quality Checklist

Before committing code:

- [ ] TypeScript strict mode passes
- [ ] All tests pass
- [ ] Coverage >= 80%
- [ ] ESLint clean
- [ ] Components accessible
- [ ] Props documented
- [ ] Examples provided
- [ ] Styles scoped properly
