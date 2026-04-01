# Bugfix Instructions - React Component Library

> **Last Updated**: February 2026

---

## 🔍 Bug Investigation Process

### Phase 1: Reproduce

**Before writing any code:**

1. **Understand the issue** - Read bug report carefully
2. **Reproduce locally** - Create minimal reproduction
3. **Verify it's a bug** - Not expected behavior
4. **Check browser compatibility** - Test across browsers
5. **Document reproduction steps** - Must be repeatable

**Create failing test FIRST:**

```typescript
describe('Bug: Button not disabled during loading', () => {
  it('should disable button when isLoading is true', () => {
    render(<Button isLoading>Click</Button>);

    // This SHOULD pass but currently FAILS
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Phase 2: Identify Root Cause

**Investigation tools:**

- **React DevTools** - Inspect component props/state
- **Browser DevTools** - Check DOM and styles
- **Console logs** - Debug state changes
- **Debugger** - Set breakpoints and step through

```typescript
// Debug component state
export function Button({ isLoading }: ButtonProps) {
  console.log('Button rendered with isLoading:', isLoading);

  return (
    <button disabled={isLoading}>
      {console.log('Rendering button, disabled:', isLoading) || 'Click'}
    </button>
  );
}
```

### Phase 3: Understand Impact

**Critical questions:**

- Which browsers affected?
- Does it break accessibility?
- Is there a workaround?
- Does it affect other components?
- Can users upgrade without issues?

---

## 🐛 Common Bug Categories & Solutions

### 1. State Management Issues

| Bug Type             | Symptoms                  | Solution            |
| -------------------- | ------------------------- | ------------------- |
| **Stale closure**    | Old values in callbacks   | Update dependencies |
| **Lost state**       | State resets unexpectedly | Check component key |
| **Wrong comparison** | Logic fails               | Fix equality check  |

**Example fix - Stale closure:**

```typescript
// ❌ BUG - Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // ❌ Always uses initial count
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Missing count dependency

  return <div>{count}</div>;
}

// ✅ FIX - Use functional update
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1); // ✅ Uses current count
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div>{count}</div>;
}
```

**Example fix - Lost state with key:**

```typescript
// ❌ BUG - No key or index as key
{items.map((item, index) => (
  <div key={index}>{item.name}</div> // ❌ State lost when reordered
))}

// ✅ FIX - Use unique stable key
{items.map(item => (
  <div key={item.id}>{item.name}</div> // ✅ State preserved
))}
```

### 2. useEffect Issues

| Bug Type               | Symptoms             | Solution             |
| ---------------------- | -------------------- | -------------------- |
| **Memory leak**        | Performance degrades | Add cleanup function |
| **Missing cleanup**    | Side effects persist | Return cleanup       |
| **Wrong dependencies** | Unexpected behavior  | Fix dependency array |

**Example fix - Memory leak:**

```typescript
// ❌ BUG - No cleanup
useEffect(() => {
  const subscription = api.subscribe(handleData);
}, []);

// ✅ FIX - Cleanup on unmount
useEffect(() => {
  const subscription = api.subscribe(handleData);
  return () => subscription.unsubscribe();
}, []);
```

**Example fix - Missing dependency:**

```typescript
// ❌ BUG - Missing dependency
useEffect(() => {
  console.log(message); // ❌ Only logs initial value
}, []);

// ✅ FIX - Add to dependencies
useEffect(() => {
  console.log(message); // ✅ Logs when message changes
}, [message]);
```

### 3. Event Handler Issues

| Bug Type                       | Symptoms                | Solution                   |
| ------------------------------ | ----------------------- | -------------------------- |
| **Handler called immediately** | Handler fires on render | Pass function reference    |
| **Multiple calls**             | Handler fires twice     | Remove duplicate listeners |
| **Stale reference**            | Old data in handler     | Include in dependencies    |

**Example fix - Handler called immediately:**

```typescript
// ❌ BUG - Handler called on render
<button onClick={handleClick()}>Click</button> // ❌ Calls immediately

// ✅ FIX - Pass function reference
<button onClick={handleClick}>Click</button> // ✅ Calls on click
<button onClick={() => handleClick(arg)}>Click</button> // ✅ With arguments
```

**Example fix - Stale reference:**

```typescript
// ❌ BUG - Old id in callback
function Item({ id, onDelete }) {
  const handleDelete = () => {
    // id might be stale if parent re-renders
    onDelete(id);
  };
  return <button onClick={handleDelete}>Delete</button>;
}

// ✅ FIX - Inline handler or useCallback with dependency
function Item({ id, onDelete }) {
  return <button onClick={() => onDelete(id)}>Delete</button>;

  // OR
  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);
  return <button onClick={handleDelete}>Delete</button>;
}
```

### 4. Rendering Issues

| Bug Type               | Symptoms             | Solution                   |
| ---------------------- | -------------------- | -------------------------- |
| **Conditional render** | Component disappears | Fix condition logic        |
| **CSS not applied**    | Styles don't show    | Fix class name or selector |
| **Performance issue**  | Component sluggish   | Memoize or optimize        |

**Example fix - Conditional render:**

```typescript
// ❌ BUG - Wrong logic
{isLoading && !error ? <Spinner /> : <Content />}
// When both isLoading and error are true, shows neither!

// ✅ FIX - Correct logic
{isLoading ? <Spinner /> : error ? <Error /> : <Content />}
```

**Example fix - CSS not applied:**

```typescript
// ❌ BUG - Typo in className
<button className={`${styles.button} ${style.primary}`}>
  {/* style.primary doesn't exist */}
</button>

// ✅ FIX - Correct className
<button className={`${styles.button} ${styles.primary}`}>
  {/* Correct */}
</button>
```

### 5. Accessibility Issues

| Bug Type          | Symptoms               | Solution                  |
| ----------------- | ---------------------- | ------------------------- |
| **Missing label** | Screen reader confused | Add aria-label or htmlFor |
| **Trap focus**    | Can't tab out modal    | Add focus trap/management |
| **Semantic HTML** | Not accessible         | Use proper HTML elements  |

**Example fix - Missing label:**

```typescript
// ❌ BUG - Icon button with no label
<button><Icon /></button>

// ✅ FIX - Add accessible label
<button aria-label="Close">
  <Icon />
</button>
```

### 6. Type Issues

| Bug Type                 | Symptoms              | Solution                   |
| ------------------------ | --------------------- | -------------------------- |
| **Wrong type**           | Type error at runtime | Fix property type          |
| **Optional not handled** | Null pointer error    | Add null check             |
| **Missing type def**     | Unknown properties    | Add proper type definition |

**Example fix - Wrong type:**

```typescript
// ❌ BUG - Wrong prop type
interface ButtonProps {
  onClick: () => void;
  children: string; // Only string!
}

<Button>Click {count}</Button> // ❌ Error: count is number

// ✅ FIX - Accept ReactNode
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

<Button>Click {count}</Button> // ✅ Works
```

**Example fix - Optional not handled:**

```typescript
// ❌ BUG - Optional prop not checked
function User({ name }: { name?: string }) {
  return <div>{name.toUpperCase()}</div>; // ❌ Crashes if name is undefined
}

// ✅ FIX - Handle optional value
function User({ name }: { name?: string }) {
  return <div>{name?.toUpperCase() ?? 'Anonymous'}</div>; // ✅ Safe
}
```

---

## 🔧 Debugging Workflow

### Step 1: Enable React DevTools

```bash
# Install React DevTools browser extension
# Then use Components and Profiler tabs
```

### Step 2: Add Debug Logs

```typescript
export function MyComponent({ prop }: MyProps) {
  console.log('MyComponent rendered, prop:', prop);

  useEffect(() => {
    console.log('Effect called, prop:', prop);
  }, [prop]);

  return <div>{prop}</div>;
}
```

### Step 3: Use Browser Debugger

```typescript
// Add breakpoint with debugger statement
export function MyComponent() {
  debugger; // ← Execution pauses here
  return <div>Content</div>;
}
```

### Step 4: Check Component Render

```bash
# Add to component to see render count
import { useRef } from 'react';

function MyComponent() {
  const renderCount = useRef(0);
  renderCount.current++;
  console.log('Render count:', renderCount.current);
  return <div>Content</div>;
}
```

---

## ✅ Bugfix Checklist

Before submitting fix:

- [ ] Bug reproduced with test
- [ ] Root cause identified
- [ ] Fix only targets root cause
- [ ] Existing tests still pass
- [ ] New test for bug added
- [ ] No new test failures
- [ ] Edge cases considered
- [ ] Backward compatible
- [ ] No console errors/warnings
- [ ] Accessibility maintained
- [ ] Mobile responsive still works
- [ ] CHANGELOG updated
