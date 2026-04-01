# Testing Instructions - React Component Library

> **Last Updated**: February 2026  
> **Testing Framework**: Vitest + React Testing Library  
> **Coverage Target**: 80%+

---

## 🎯 Testing Philosophy

### Test User Behavior, Not Implementation

**✅ Test what users see and do:**

```typescript
it('should show error message when form is invalid', async () => {
  render(<LoginForm />);

  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);

  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

**❌ Don't test implementation details:**

```typescript
it('should update state when input changes', () => {
  const { result } = renderHook(() => useState(''));
  // Testing internal state = implementation detail
  expect(result.current[0]).toBe('');
});
```

---

## 📊 Coverage Targets

| Layer          | Minimum Coverage | Priority    |
| -------------- | ---------------- | ----------- |
| **Hooks**      | 90%+             | 🔴 Critical |
| **Components** | 80%+             | 🟡 High     |
| **Utils**      | 85%+             | 🟡 High     |
| **Context**    | 90%+             | 🔴 Critical |

**Overall Target**: 80%+

---

## 📁 Test File Organization

### File Placement

Tests live next to components:

```
src/components/Button/
  ├── Button.tsx
  └── Button.test.tsx  ← Same directory

src/hooks/
  ├── useModal.ts
  └── useModal.test.ts ← Same directory
```

### Naming Convention

| Code File     | Test File          |
| ------------- | ------------------ |
| `Button.tsx`  | `Button.test.tsx`  |
| `useModal.ts` | `useModal.test.ts` |

---

## 🎭 Test Structure

### Component Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);

    expect(
      screen.getByRole('button', { name: /click me/i })
    ).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should have aria-label', () => {
    render(<Button aria-label="Save changes">Save</Button>);

    expect(screen.getByLabelText('Save changes')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Button className="custom-class">Click</Button>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render different variants', () => {
    const { container: primaryContainer } = render(
      <Button variant="primary">Primary</Button>
    );

    const { container: secondaryContainer } = render(
      <Button variant="secondary">Secondary</Button>
    );

    expect(primaryContainer.firstChild).toHaveClass('primary');
    expect(secondaryContainer.firstChild).toHaveClass('secondary');
  });
});
```

### Hook Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

---

## 🎭 Testing Patterns

### Querying Elements

**Prefer accessible queries (in order):**

```typescript
// 1️⃣ BEST: By role (most accessible)
screen.getByRole('button', { name: /submit/i });

// 2️⃣ GOOD: By label (form inputs)
screen.getByLabelText('Email');

// 3️⃣ OK: By placeholder
screen.getByPlaceholderText('Enter name');

// 4️⃣ LAST RESORT: By test ID
screen.getByTestId('submit-button');

// ❌ AVOID: By class or CSS selector
container.querySelector('.submit-button');
```

### User Interactions

```typescript
import userEvent from '@testing-library/user-event';

describe('Form Interactions', () => {
  it('should type in input', async () => {
    const user = userEvent.setup();
    render(<input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'hello world');

    expect(input).toHaveValue('hello world');
  });

  it('should click button', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<button onClick={handleClick}>Click</button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalled();
  });

  it('should select option', async () => {
    const user = userEvent.setup();
    render(
      <select>
        <option value="">Select...</option>
        <option value="1">Option 1</option>
      </select>
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '1');

    expect(select).toHaveValue('1');
  });
});
```

### Accessibility Testing

```typescript
describe('Accessibility', () => {
  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <button onClick={handleClick} tabIndex={0}>
        Click
      </button>
    );

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalled();
  });

  it('should have proper ARIA labels', () => {
    render(
      <button aria-label="Close dialog">
        ×
      </button>
    );

    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  });

  it('should announce errors to screen readers', () => {
    render(
      <div>
        <input aria-describedby="error" />
        <span id="error" role="alert">
          This field is required
        </span>
      </div>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('required');
  });
});
```

### Testing Async Operations

```typescript
describe('Async Operations', () => {
  it('should handle async data loading', async () => {
    render(<UserProfile userId="1" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    const user = await screen.findByText(/john doe/i);
    expect(user).toBeInTheDocument();
  });

  it('should handle loading errors', async () => {
    render(<UserProfile userId="invalid" />);

    const error = await screen.findByText(/failed to load/i);
    expect(error).toBeInTheDocument();
  });
});
```

### Mocking

```typescript
describe('With Mocks', () => {
  it('should call API function', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ name: 'John' });
    render(<UserProfile userId="1" onFetch={mockFetch} />);

    await screen.findByText('John');

    expect(mockFetch).toHaveBeenCalledWith('1');
  });

  it('should handle rejected promise', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('API Error'));
    render(<UserProfile userId="1" onFetch={mockFetch} />);

    const error = await screen.findByText(/api error/i);
    expect(error).toBeInTheDocument();
  });
});
```

---

## 📊 Coverage Analysis

### Running Coverage

```bash
pnpm test:cov
```

This generates a coverage report including:

- Line coverage
- Branch coverage
- Function coverage
- Statements covered

### Improving Coverage

```typescript
// ❌ LOW COVERAGE: Missing edge cases
export function divide(a: number, b: number): number {
  return a / b;
}

// ✅ HIGH COVERAGE: All paths tested
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

describe('divide', () => {
  it('should divide numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should throw on divide by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
  });
});
```

---

## ✅ Testing Checklist

Before committing code:

- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] Coverage >= 80%
- [ ] User interactions tested
- [ ] Accessibility tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] No console.log() statements
- [ ] Tests are deterministic (not flaky)
- [ ] Meaningful test names
