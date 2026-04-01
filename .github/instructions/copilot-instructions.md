# Copilot Instructions - React Component Library

> **Purpose**: Development guidelines for React component libraries - reusable, well-structured components for modern apps.

---

## 🎯 Module Overview

**Package**: `@ciscode/ui-components` (example)  
**Type**: React Component Library  
**Framework**: React 18+, TypeScript 5+  
**Build**: Vite/tsup  
**Testing**: Vitest + React Testing Library  
**Distribution**: NPM package  
**Purpose**: Reusable, production-ready React components for building modern UIs

### Typical Module Responsibilities:

- Atomic UI components (Button, Input, Card, etc.)
- Composite components (Form, Modal, Navigation, etc.)
- Hooks for common patterns
- Type definitions and props interfaces
- Accessibility compliance (WCAG 2.1 AA)
- Theming and customization
- Comprehensive documentation

---

## 🏗️ Module Structure

```
src/
  ├── components/                     # React components
  │   ├── Button/
  │   │   ├── Button.tsx              # Component
  │   │   ├── Button.test.tsx         # Tests
  │   │   ├── Button.types.ts         # Props types
  │   │   └── index.ts                # Exports
  │   ├── Input/
  │   ├── Modal/
  │   └── Form/
  ├── hooks/                          # Custom hooks
  │   ├── useModal.ts
  │   ├── useForm.ts
  │   └── useModal.test.ts
  ├── context/                        # Context providers
  │   ├── ThemeContext.tsx
  │   └── FormContext.tsx
  ├── types/                          # TypeScript types
  │   └── common.types.ts
  ├── utils/                          # Utilities
  │   └── classNameUtils.ts
  └── index.ts                        # Public API
```

---

## 📝 Naming Conventions

**Components**: `PascalCase.tsx`

- `Button.tsx`
- `Modal.tsx`
- `FormField.tsx`

**Hooks**: `camelCase.ts` with `use` prefix

- `useModal.ts`
- `useForm.ts`
- `useTheme.ts`

**Types**: `PascalCase` + `Props` or `Types` suffix

- `ButtonProps.ts`
- `ModalTypes.ts`

**Utils**: `camelCase.ts`

- `classNameUtils.ts`
- `styleUtils.ts`

---

## 🧪 Testing - Component Library Standards

### Coverage Target: 80%+

**Component Tests:**

- ✅ All interactive components
- ✅ User interactions (clicks, typing, etc.)
- ✅ State management
- ✅ Props variations
- ✅ Accessibility (ARIA, keyboard nav)
- ✅ Error states and edge cases

**Hook Tests:**

- ✅ All custom hooks
- ✅ State changes
- ✅ Side effects
- ✅ Error handling

**Skip:**

- ❌ Purely presentational components (no logic)
- ❌ External library internals

**Test file organization:**

```
src/components/Button/
  ├── Button.tsx
  └── Button.test.tsx             ← Same directory
```

---

## 📚 Documentation - Complete

### JSDoc for Components:

````typescript
export interface ButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Button click handler */
  onClick?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary';
  /** Is button disabled */
  disabled?: boolean;
}

/**
 * Reusable button component with multiple variants
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
}: ButtonProps): JSX.Element {
  // implementation
}
````

### Hook Documentation:

````typescript
/**
 * Hook for managing modal open/close state
 * @returns Modal state and methods
 * @example
 * ```tsx
 * const { isOpen, open, close } = useModal();
 *
 * return (
 *   <>
 *     <button onClick={open}>Open Modal</button>
 *     {isOpen && <Modal onClose={close}>Content</Modal>}
 *   </>
 * );
 * ```
 */
export function useModal(): UseModalReturn {
  // implementation
}
````

---

## 🚀 Component Development Principles

### 1. Headless & Customizable

**Unstyled by default:**

```typescript
// ✅ GOOD: Accept className prop
<Button className="my-custom-styles">Click</Button>

// Also provide default styles via CSS module
import styles from './Button.module.css';
<button className={`${styles.button} ${className}`} />

// Or use default minimal styles
import '@ciscode/ui-components/styles.css';
```

### 2. Composition Over Configuration

**Composable components:**

```typescript
// ✅ GOOD: Composable structure
<Form>
  <Form.Field label="Email">
    <Input type="email" />
  </Form.Field>
  <Form.Field label="Password">
    <Input type="password" />
  </Form.Field>
  <Form.Submit>Sign In</Form.Submit>
</Form>

// Also support all-in-one for quick use
<SimpleForm onSubmit={handleSubmit} />
```

### 3. Accessibility First

**ALWAYS:**

- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Color contrast compliance
- ✅ Semantic HTML

### 4. TypeScript Strict Mode

**All props with explicit types:**

```typescript
// ✅ GOOD: Strict typing
interface ButtonProps {
  onClick: () => void;
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}

// ❌ BAD: Implicit any
interface ButtonProps {
  onClick: any;
  variant: any;
  size?: string;
}
```

### 5. Export Strategy

**Export ONLY public API:**

```typescript
// src/index.ts - Public exports
export { Button } from './components/Button';
export { Modal } from './components/Modal';
export { Input } from './components/Input';
export { Form } from './components/Form';

// Hooks
export { useModal } from './hooks/useModal';
export { useForm } from './hooks/useForm';

// Types (for TypeScript users)
export type { ButtonProps, ModalProps, InputProps, FormProps } from './components';

// ❌ NEVER export internal utilities
// export { validateEmail } from './utils/validation'; // FORBIDDEN
```

---

## 🔄 Workflow & Task Management

### Task-Driven Development

**1. Branch Creation:**

```bash
feature/UI-MODULE-123-add-datepicker
bugfix/UI-MODULE-456-fix-modal-focus
refactor/UI-MODULE-789-extract-button-styles
```

**2. Task Documentation:**

Create task file:

```
docs/tasks/active/UI-MODULE-123-add-datepicker.md
```

**Task structure:**

```markdown
# UI-MODULE-123: Add Date Picker Component

## Description

Reusable date picker component with range selection support

## Implementation Details

- Component: DatePicker.tsx
- Uses react-day-picker library
- Keyboard accessible, WCAG compliant

## Files Modified

- src/components/DatePicker/DatePicker.tsx (new)
- src/components/DatePicker/DatePicker.test.tsx (new)
- src/index.ts (exports)

## Breaking Changes

- None (backward compatible)

## Accessibility

- Keyboard navigation with arrow keys
- Screen reader friendly
- Focus management
```

**3. On Release:**

Move to:

```
docs/tasks/archive/by-release/v2.0.0/UI-MODULE-123-add-datepicker.md
```

### Git Flow

**Branch Structure:**

- `master` - Production releases only
- `develop` - Active development
- `feature/UI-MODULE-*` - New components/features
- `bugfix/UI-MODULE-*` - Bug fixes

**Workflow:**

```bash
# 1. Branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/UI-MODULE-123-datepicker

# 2. Development
# ... implement components, test, document ...

# 3. Bump version and push
pnpm version minor
git push origin feature/UI-MODULE-123-datepicker --tags

# 4. PR to develop
gh pr create --base develop

# 5. After merge to develop, for release:
git checkout master
git merge develop
git push origin master --tags
pnpm publish
```

**⚠️ IMPORTANT:**

- ✅ Feature branch from `develop`
- ✅ PR to `develop`
- ✅ `master` for releases only
- ❌ NEVER direct PRs to `master`

---

## 🎨 Component Patterns

### Controlled & Uncontrolled:

```typescript
// Uncontrolled (default)
<Input placeholder="Enter text" onChange={handleChange} />

// Controlled
<Input
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>
```

### Composition Pattern:

```typescript
// ✅ GOOD: Composable
<Modal>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button>Close</Button>
  </Modal.Footer>
</Modal>

// Also support simple version
<SimpleModal title="Title">Content</SimpleModal>
```

### Props Spreading:

```typescript
// ✅ GOOD: Accept additional props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant, ...props }: ButtonProps) {
  return <button {...props} />;
}

// Usage
<Button variant="primary" aria-label="Save" disabled={false} />
```

---

## 🌍 Styling Approach

### CSS Modules (Recommended):

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

### Tailwind CSS (Alternative):

```typescript
export function Button({ variant = 'primary' }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variantClasses = {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-800',
  };

  return <button className={`${baseClasses} ${variantClasses[variant]}`} />;
}
```

---

## 📦 Versioning & Breaking Changes

### Semantic Versioning

**MAJOR** - Breaking:

- Removed components
- Changed component props (removed/renamed)
- Changed hook return values
- Changed TypeScript types

**MINOR** - New features:

- New components
- New optional props
- New hooks

**PATCH** - Fixes:

- Bug fixes
- Style improvements
- Documentation

### Version Bump Command

**ALWAYS run before pushing:**

```bash
pnpm version patch  # Bug fixes (0.0.x)
pnpm version minor  # New features (0.x.0)
pnpm version major  # Breaking changes (x.0.0)

# Then push:
git push && git push --tags
```

---

## 🚫 Restrictions

**NEVER without approval:**

- Breaking changes to component APIs
- Removing exported components
- Changing TypeScript types
- Major dependency upgrades

**CAN do autonomously:**

- New components (non-breaking)
- Bug fixes
- Style improvements
- Documentation

---

## ✅ Release Checklist

- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] No ESLint/TypeScript errors
- [ ] All components documented
- [ ] Accessibility verified (WCAG AA)
- [ ] Mobile responsive tested
- [ ] All browsers tested (Chrome, Firefox, Safari, Edge)
- [ ] README with examples
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Storybook updated (if applicable)

### Pre-Publish Hook (Recommended)

Add to `package.json`:

```json
"scripts": {
  "prepublishOnly": "pnpm run verify && pnpm run test:cov"
}
```

---

## 🎨 Code Style

**React Best Practices:**

- Functional components only
- Custom hooks for logic
- Components small and focused
- Props destructuring
- Composition > Props drilling

**TypeScript:**

- Strict mode enabled
- All types explicit
- Props interfaces exported
- Generic types for flexibility

---

## 🐛 Error Handling

**User-facing errors:**

Provide helpful error messages in component props:

```typescript
interface InputProps {
  error?: string;
  helperText?: string;
}

export function Input({ error, helperText }: InputProps) {
  return (
    <div>
      <input aria-invalid={!!error} />
      {error && <span className="error">{error}</span>}
      {helperText && <span className="helper">{helperText}</span>}
    </div>
  );
}
```

---

## 📖 Development Workflow

**Simple changes:**

- Implement → Test → Update docs → Update CHANGELOG

**Complex changes:**

- Discuss approach → Implement → Test accessibility → Update docs → CHANGELOG → Version bump

**When blocked:**

- **DO**: Ask immediately
- **DON'T**: Break component APIs without approval
