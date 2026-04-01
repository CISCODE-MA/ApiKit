# Component Development Instructions - React Library

> **Purpose**: React component development standards for building reusable, accessible, and well-tested components.

---

## 🎯 Component Architecture

### Component Structure

```
ComponentName/
  ├── ComponentName.tsx       # Main component
  ├── ComponentName.test.tsx  # Tests
  ├── ComponentName.types.ts  # Props & types
  ├── ComponentName.module.css# Styles (or tailwind)
  └── index.ts                # Exports
```

### Component Template

````typescript
import React, { useState } from 'react';
import { ComponentNameProps } from './ComponentName.types';
import styles from './ComponentName.module.css';

/**
 * Brief description of component purpose
 *
 * @accessibility
 * - Keyboard accessible
 * - Screen reader friendly
 *
 * @example
 * ```tsx
 * <ComponentName prop="value">Content</ComponentName>
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`} {...props}>
      {children}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
````

---

## 📝 Props Standards

### Props Interface

```typescript
export interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Primary content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Callback on action */
  onAction?: (data: ActionData) => void;
  /** Accessibility label */
  'aria-label'?: string;
  /** Is component disabled */
  disabled?: boolean;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'secondary';
}
```

### Required Props Documentation

- ✅ JSDoc for all props
- ✅ Type definitions clear
- ✅ Default values specified
- ✅ Callback signatures with examples
- ✅ Accessibility props documented

---

## ♿ Accessibility (A11y)

### WCAG 2.1 AA Compliance

```typescript
// ✅ Good
<button
  aria-label="Save document"
  aria-busy={isLoading}
  disabled={isLoading}
>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// ❌ Bad
<button onClick={save}>Save</button>
```

### Keyboard Navigation

- ✅ All interactive elements keyboard accessible
- ✅ Logical tab order
- ✅ Enter/Space triggers actions
- ✅ Escape closes modals/dropdowns
- ✅ Arrow keys for list/menu navigation

### Screen Reader Support

- ✅ `aria-label` for icon buttons
- ✅ `aria-describedby` for error messages
- ✅ `role` attributes where needed
- ✅ Live regions for dynamic content
- ✅ Semantic HTML elements

```typescript
// ✅ GOOD: Semantic and accessible
<form>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" aria-describedby="email-error" />
  {error && (
    <span id="email-error" role="alert">
      {error}
    </span>
  )}
</form>

// ❌ BAD: Not semantic
<div>
  <span>Email</span>
  <input type="text" />
  {error && <span>{error}</span>}
</div>
```

### Color & Contrast

```typescript
// ✅ GOOD: Good contrast ratio (4.5:1 for normal text)
<button className={styles.primaryButton}>
  {/* Text color has good contrast with button background */}
</button>

// ❌ BAD: Insufficient contrast
<button style={{ color: '#ccc', background: '#ddd' }}>
  {/* Barely visible text */}
</button>
```

---

## 🎨 Theming & Styling

### Theme Support

```typescript
import { useTheme } from '../context/ThemeContext';

export const ThemedButton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <button
      style={{
        backgroundColor: theme.colors.primary,
        color: theme.colors.text,
      }}
    >
      Click
    </button>
  );
};
```

### CSS Modules

```typescript
import styles from './Button.module.css';

export function Button({ variant }: ButtonProps) {
  return <button className={`${styles.button} ${styles[variant]}`} />;
}
```

**Button.module.css:**

```css
.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.primary:hover:not(:disabled) {
  background: #2563eb;
}

.secondary {
  background: #e5e7eb;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.secondary:hover:not(:disabled) {
  background: #d1d5db;
}
```

### Responsive Design

```typescript
// ✅ GOOD: Mobile-first approach
import styles from './Button.module.css';

export function Button({ size }: ButtonProps) {
  return <button className={`${styles.button} ${styles[size]}`} />;
}
```

**Button.module.css:**

```css
.button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .button {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
}
```

---

## 🧪 Component Testing

### Test Coverage Requirements

```typescript
describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: /click me/i }))
      .toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be keyboard accessible', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalled();
  });

  it('should have accessible label', () => {
    render(<Button aria-label="Save changes">Save</Button>);

    expect(screen.getByLabel('Save changes')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Button className="custom-class">Click</Button>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render different variants', () => {
    const { container } = render(<Button variant="secondary">Click</Button>);

    expect(container.firstChild).toHaveClass('secondary');
  });
});
```

---

## 🏗️ Component Best Practices

### 1. Keep Components Small

```typescript
// ✅ GOOD: Small, focused component
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ BAD: Too much logic in one component
export function Button({ ... }) {
  // ... 200 lines of code
}
```

### 2. Use Composition

```typescript
// ✅ GOOD: Composable
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Action</Card.Footer>
</Card>

// ❌ BAD: Not composable
<Card title="Title" content="Content" footer="Action" />
```

### 3. Prop Spreading for HTML Attributes

```typescript
// ✅ GOOD: Accept HTML attributes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <>
      {label && <label>{label}</label>}
      <input {...props} />
    </>
  );
}

// Usage: All standard input attributes work
<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  disabled={false}
  aria-label="Email address"
/>

// ❌ BAD: Manual prop management
interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  // ... every HTML attribute individually
}
```

### 4. Memoization for Performance

```typescript
// ✅ GOOD: Memoize expensive components
interface ListItemProps {
  item: Item;
  onClick: (item: Item) => void;
}

export const ListItem = React.memo(function ListItem({
  item,
  onClick,
}: ListItemProps) {
  console.log('Rendering ListItem:', item.id);
  return (
    <li onClick={() => onClick(item)}>
      {item.name}
    </li>
  );
});

// ❌ BAD: Recreate function on every render
<ListItem onClick={() => handleClick(item)} />

// ✅ GOOD: Use useCallback
const handleClick = useCallback((item: Item) => {
  // Handle click
}, []);

<ListItem onClick={handleClick} />
```

---

## 📖 Component Documentation

### README Example

````markdown
# Button Component

Reusable button component with multiple variants and sizes.

## Installation

```bash
npm install @ciscode/ui-components
```
````

## Usage

```tsx
import { Button } from '@ciscode/ui-components';

export function App() {
  return (
    <Button variant="primary" onClick={() => console.log('clicked')}>
      Click me
    </Button>
  );
}
```

## Props

| Prop        | Type                     | Default     | Description      |
| ----------- | ------------------------ | ----------- | ---------------- |
| `children`  | `React.ReactNode`        | -           | Button content   |
| `onClick`   | `() => void`             | -           | Click handler    |
| `variant`   | `'primary'\|'secondary'` | `'primary'` | Visual style     |
| `disabled`  | `boolean`                | `false`     | Disable button   |
| `className` | `string`                 | -           | Custom CSS class |

## Accessibility

- Keyboard accessible (Enter/Space)
- Screen reader friendly
- WCAG 2.1 AA compliant

## Examples

### Primary Variant

```tsx
<Button variant="primary">Primary</Button>
```

### Disabled State

```tsx
<Button disabled>Disabled</Button>
```

```

---

## ✅ Component Checklist

Before submitting component:

- [ ] Component tested (80%+ coverage)
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] Mobile responsive
- [ ] Props documented
- [ ] Examples provided
- [ ] TypeScript strict mode
- [ ] No console errors/warnings
- [ ] Styles scoped properly
- [ ] README updated
```
