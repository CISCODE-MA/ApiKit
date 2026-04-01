# Features Instructions - React Component Library

> **Last Updated**: February 2026

---

## 🚀 Before Starting Any Feature

### Pre-Implementation Checklist

- [ ] **Check existing components** - Avoid duplication
- [ ] **Understand scope** - Breaking change? (MAJOR version)
- [ ] **Review component API** - Changes to props?
- [ ] **Check dependencies** - Need new npm packages?
- [ ] **Plan backwards compatibility** - Can users upgrade?
- [ ] **Consider accessibility** - WCAG compliance?
- [ ] **Mobile responsive?** - Test on multiple sizes?

### Questions to Ask

1. **Already exists?**

   ```bash
   find src/components -name "*ComponentName*"
   ```

2. **Right abstraction level?**
   - Too specific to one use case?
   - Reusable across different contexts?
   - Single responsibility?

3. **Impact assessment?**
   - Breaking → MAJOR version
   - New component → MINOR version
   - Enhancement/fix → PATCH version

---

## 📋 Implementation Workflow

```
1. Design → 2. Implement → 3. Test → 4. Document → 5. Release
```

### 1️⃣ Design Phase

- [ ] Define component responsibility
- [ ] Define props interface
- [ ] Plan accessibility requirements
- [ ] Design keyboard interactions
- [ ] Plan responsive behavior
- [ ] Consider mobile-first approach
- [ ] Plan theme/style strategy

### 2️⃣ Implementation Phase

- [ ] Create feature branch: `feature/UI-MODULE-*`
- [ ] Create component file structure
- [ ] Implement TypeScript types
- [ ] Implement component with accessibility
- [ ] Add CSS Module styles
- [ ] Handle edge cases
- [ ] Add prop validation

### 3️⃣ Testing Phase

- [ ] Component rendering tests
- [ ] User interaction tests
- [ ] Props variation tests
- [ ] Accessibility tests (keyboard, screen reader)
- [ ] Responsive design tests
- [ ] Error state tests
- [ ] Coverage >= 80%

### 4️⃣ Documentation Phase

- [ ] JSDoc for component
- [ ] Props documentation
- [ ] Usage examples in README
- [ ] Accessibility notes
- [ ] Update CHANGELOG
- [ ] Add Storybook story (if applicable)

### 5️⃣ Release Phase

- [ ] Bump version: `pnpm version [minor|major]`
- [ ] Build library
- [ ] Create PR to `develop`
- [ ] Release from `master`

---

## ➕ Adding New Component

### Example: Badge Component

**Step 1: Design Props Interface**

```typescript
// src/components/Badge/Badge.types.ts
export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom CSS class */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
}
```

**Step 2: Create Styles**

```css
/* src/components/Badge/Badge.module.css */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-weight: 500;
  white-space: nowrap;
}

.sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.md {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.lg {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.default {
  background-color: #e5e7eb;
  color: #1f2937;
}

.success {
  background-color: #dcfce7;
  color: #15803d;
}

.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.error {
  background-color: #fee2e2;
  color: #991b1b;
}

.info {
  background-color: #dbeafe;
  color: #1e40af;
}
```

**Step 3: Implement Component**

````typescript
// src/components/Badge/Badge.tsx
import React from 'react';
import { BadgeProps } from './Badge.types';
import styles from './Badge.module.css';

/**
 * Badge component for displaying status, counts, or labels
 *
 * @accessibility
 * - Semantic HTML with role="status"
 * - Screen reader friendly
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" size="lg">3 Errors</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <span
      className={`
        ${styles.badge}
        ${styles[variant]}
        ${styles[size]}
        ${className || ''}
      `}
      role="status"
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
````

**Step 4: Create Tests**

```typescript
// src/components/Badge/Badge.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('should render children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should apply variant class', () => {
    const { container } = render(<Badge variant="success">Done</Badge>);
    expect(container.firstChild).toHaveClass('success');
  });

  it('should apply size class', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    expect(container.firstChild).toHaveClass('lg');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Badge className="custom">Custom</Badge>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should have accessible role', () => {
    render(<Badge>Accessible</Badge>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should accept aria-label', () => {
    render(<Badge aria-label="Status badge">Badge</Badge>);
    expect(screen.getByLabel('Status badge')).toBeInTheDocument();
  });

  it('should render all variants', () => {
    const variants = ['default', 'success', 'warning', 'error', 'info'];
    const { container: baseContainer } = render(<Badge>Test</Badge>);

    variants.forEach((variant) => {
      const { container } = render(
        <Badge variant={variant as any}>Test</Badge>
      );
      expect(container.firstChild).toHaveClass(variant);
    });
  });

  it('should render all sizes', () => {
    const sizes = ['sm', 'md', 'lg'];
    sizes.forEach((size) => {
      const { container } = render(
        <Badge size={size as any}>Test</Badge>
      );
      expect(container.firstChild).toHaveClass(size);
    });
  });
});
```

**Step 5: Create Index Export**

```typescript
// src/components/Badge/index.ts
export { Badge } from './Badge';
export type { BadgeProps } from './Badge.types';
```

**Step 6: Update Main Export**

```typescript
// src/index.ts
export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';
```

**Step 7: Update README**

````markdown
## Components

### Badge

Status badge component with multiple variants.

```tsx
<Badge variant="success">Active</Badge>
```
````

**Props:**

- `children` - Badge content
- `variant` - 'default' | 'success' | 'warning' | 'error' | 'info'
- `size` - 'sm' | 'md' | 'lg'
- `className` - Custom CSS class

````

---

## ➕ Adding New Hook

### Example: useToggle Hook

**Step 1: Implement Hook**

```typescript
// src/hooks/useToggle.ts
import { useState, useCallback } from 'react';

/**
 * Hook for managing boolean state with toggle functionality
 * @param initialState Initial boolean value
 * @returns [value, toggle, setValue]
 *
 * @example
 * ```tsx
 * const [isOpen, toggle, setOpen] = useToggle(false);
 * return (
 *   <>
 *     <button onClick={toggle}>Toggle</button>
 *     {isOpen && <Modal />}
 *   </>
 * );
 * ```
 */
export function useToggle(
  initialState: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialState);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}
````

**Step 2: Create Tests**

```typescript
// src/hooks/useToggle.test.ts
import { renderHook, act } from '@testing-library/react';
import { useToggle } from './useToggle';

describe('useToggle', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(false);
  });

  it('should set value directly', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[2](true);
    });

    expect(result.current[0]).toBe(true);
  });
});
```

**Step 3: Export from index**

```typescript
export { useToggle } from './hooks/useToggle';
```

---

## 🔄 Handling Breaking Changes

### Example: Rename Component Prop

**Before**: `isVisible` prop
**After**: `show` prop

**Steps:**

1. Add new prop
2. Keep old prop (deprecated)
3. Warn in console for deprecated prop
4. Bump MAJOR version
5. Remove old prop in next major release

```typescript
interface ButtonProps {
  // ✅ New prop
  show?: boolean;
  // ⚠️ Deprecated prop (backward compatibility)
  isVisible?: boolean;
}

export function Button({ show, isVisible, ...props }: ButtonProps) {
  if (isVisible !== undefined) {
    console.warn(
      'Button: isVisible prop is deprecated. Use show instead.'
    );
  }

  const visible = show ?? isVisible ?? true;
  return <button {...props} style={{ display: visible ? 'block' : 'none' }} />;
}
```

---

## ✅ Feature Checklist

Before submitting PR:

- [ ] Component/hook follows structure
- [ ] Tests written (80%+ coverage)
- [ ] Accessibility tested
- [ ] Mobile responsive
- [ ] TypeScript strict mode
- [ ] Props documented
- [ ] Examples provided
- [ ] CSS properly scoped
- [ ] No console errors/warnings
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] ESLint clean
- [ ] Backward compatible
