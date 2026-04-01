---
applyTo: '**/*'
---

These are some guidelines when using the SonarQube MCP server.

# Important Tool Guidelines

## Basic usage

- **IMPORTANT**: After you finish generating or modifying any code files at the very end of the task, you MUST call the `analyze_file_list` tool (if it exists) to analyze the files you created or modified.
- **IMPORTANT**: When starting a new task, you MUST disable automatic analysis with the `toggle_automatic_analysis` tool if it exists.
- **IMPORTANT**: When you are done generating code at the very end of the task, you MUST re-enable automatic analysis with the `toggle_automatic_analysis` tool if it exists.

## Project Keys

- When a user mentions a project key, use `search_my_sonarqube_projects` first to find the exact project key
- Don't guess project keys - always look them up

## Code Language Detection

- When analyzing code snippets, detect the programming language from the code syntax
- If unclear, ask the user or make an educated guess based on syntax
- React TypeScript code should be analyzed using TypeScript language specification

## Branch and Pull Request Context

- Many operations support branch-specific analysis
- If user mentions working on a feature branch, include the branch parameter
- For PR analysis, use the PR-specific analysis tools if available

## Code Issues and Violations

- After fixing issues, do not attempt to verify them using `search_sonar_issues_in_projects`, as the server will not yet reflect the updates
- Focus on fixing code smells, security hotspots, and bugs identified by SonarQube

---

## Frontend-Specific Quality Gates

### React/TypeScript Quality Standards

**Code Smells to Address:**

- Unused imports and variables
- Duplicate code blocks
- Complex functions (>20 lines)
- Missing error handling
- Inefficient re-renders
- Missing null/undefined checks
- Prop drilling anti-patterns

**Security Hotspots:**

- Unsafe use of `dangerouslySetInnerHTML`
- Inline event handlers causing re-renders
- Missing CSRF tokens
- Sensitive data in state/localStorage
- Unvalidated user input rendering
- XSS vulnerabilities

**Type Safety:**

- Use of `any` type (avoid)
- Missing null checks on optional props
- Incorrect type definitions
- Unsafe type assertions
- Missing error type definitions

**Performance Issues:**

- Unnecessary re-renders
- Missing React.memo() opportunities
- Large bundle chunks
- Missing useCallback/useMemo
- Inefficient list rendering (wrong keys)

**Accessibility Issues:**

- Missing alt text on images
- Missing ARIA labels
- Color contrast issues
- Missing focus management
- Non-semantic HTML usage

**Testing Coverage:**

- Components should have 80%+ coverage
- Hooks should have 90%+ coverage
- Lines with no tests should be minimized
- All user interactions should be tested
- Accessibility should be tested

---

## Common Issues & Fixes

### Issue: High Complexity in Component

**Problem**: Component rendering logic has too many branches

```typescript
// ❌ HIGH COMPLEXITY
export function Dashboard() {
  return (
    <>
      {isLoading && <Spinner />}
      {!isLoading && error && <Error />}
      {!isLoading && !error && data && data.length > 0 && (
        <div>
          {data.map((item) => (
            <div key={item.id}>
              {item.type === 'A' && <TypeA />}
              {item.type === 'B' && <TypeB />}
              {item.type === 'C' && <TypeC />}
              {/* ... more nested conditions */}
            </div>
          ))}
        </div>
      )}
      {!isLoading && !error && (!data || data.length === 0) && (
        <Empty />
      )}
    </>
  );
}

// ✅ REFACTORED - Extract sub-components
export function Dashboard() {
  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  if (!data || data.length === 0) return <Empty />;

  return (
    <div>
      {data.map((item) => (
        <ItemRenderer key={item.id} item={item} />
      ))}
    </div>
  );
}

function ItemRenderer({ item }) {
  const Component = {
    A: TypeA,
    B: TypeB,
    C: TypeC,
  }[item.type];

  return Component ? <Component /> : null;
}
```

### Issue: Duplicate Code in Components

**Problem**: Similar component logic repeated in multiple places

```typescript
// ❌ DUPLICATE
function UserCard({ user }) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  );
}

// ✅ EXTRACT COMMON COMPONENT
function Card({ title, subtitle }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}

function UserCard({ user }) {
  return <Card title={user.name} subtitle={user.email} />;
}

function ProductCard({ product }) {
  return <Card title={product.name} subtitle={product.description} />;
}
```

### Issue: Missing Null/Undefined Check

**Problem**: Optional prop accessed without checking

```typescript
// ❌ NO CHECK
interface UserProps {
  user?: User;
}

export function UserProfile({ user }: UserProps) {
  return <div>{user.name}</div>; // ❌ Crashes if user undefined
}

// ✅ WITH CHECK
export function UserProfile({ user }: UserProps) {
  if (!user) return <div>No user</div>;
  return <div>{user.name}</div>;

  // OR use optional chaining
  return <div>{user?.name ?? 'Anonymous'}</div>;
}
```

### Issue: Performance - Unnecessary Re-renders

**Problem**: Component re-renders on every render of parent

```typescript
// ❌ BAD: Re-renders every time parent renders
function List() {
  const items = [1, 2, 3]; // New array every render
  return (
    <div>
      {items.map((item) => (
        <ListItem key={item} item={item} />
      ))}
    </div>
  );
}

// ✅ GOOD: Memoize expensive component
const ListItem = React.memo(function ListItem({ item }) {
  return <div>{item}</div>;
});

function List() {
  const items = useMemo(() => [1, 2, 3], []);
  return (
    <div>
      {items.map((item) => (
        <ListItem key={item} item={item} />
      ))}
    </div>
  );
}
```

### Issue: Unsafe HTML Rendering

**Problem**: User content rendered with `dangerouslySetInnerHTML`

```typescript
// ❌ XSS RISK
export function Comment({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
  // ❌ User can inject malicious JavaScript
}

// ✅ SAFE: Let React escape content
export function Comment({ text }) {
  return <div>{text}</div>;
  // ✅ React automatically escapes content
}

// Alternative: Use sanitization library if HTML needed
import DOMPurify from 'dompurify';

export function RichComment({ html }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### Issue: Accessibility - Missing Alt Text

**Problem**: Images without alt text attribute

```typescript
// ❌ NOT ACCESSIBLE
<img src={imageUrl} />

// ✅ ACCESSIBLE
<img src={imageUrl} alt="Product thumbnail" />

// ✅ DECORATIVE IMAGE
<img src={decorativePattern} alt="" />
```

### Issue: Accessibility - Missing ARIA Labels

**Problem**: Icon button without accessible label

```typescript
// ❌ NOT ACCESSIBLE
<button onClick={onClose}>
  <CloseIcon />
</button>

// ✅ ACCESSIBLE
<button aria-label="Close modal" onClick={onClose}>
  <CloseIcon />
</button>
```

---

## Troubleshooting

### Authentication Issues

- SonarQube requires USER tokens (not project tokens)
- When the error `SonarQube answered with Not authorized` occurs, verify the token type
- Ensure the token has the correct permissions for project analysis

### Project Not Found

- Use `search_my_sonarqube_projects` to find available projects
- Verify project key spelling and format
- Ensure you have permission to access the project

### Analysis Not Running

- Check that the project is properly configured
- Verify that all required build tools are installed
- Ensure the code language is correctly specified
- Check SonarQube logs for detailed error messages

### Code Quality Gate Failing

- Review the issues found by SonarQube
- Address high-priority bugs first
- Fix security vulnerabilities immediately
- Improve code coverage for critical paths
- Resolve code smells and refactor complex methods

---

## Best Practices for React Components

### 1. Clean Code

- Keep components focused (single responsibility)
- Use meaningful variable names
- Extract complex logic into custom hooks
- Add comments for non-obvious code

### 2. Type Safety

- Always use explicit types for props
- Avoid `any` type
- Use strict TypeScript configuration
- Validate all props in interfaces

### 3. Performance

- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers
- Lazy load components with `React.lazy`
- Optimize re-renders with React.memo

### 4. Testing

- Write tests for all interactive components
- Test user interactions (not implementation)
- Test accessibility features
- Maintain 80%+ code coverage

### 5. Accessibility

- Use semantic HTML elements
- Add ARIA labels and roles
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast (4.5:1 for text)

### 6. Security

- Sanitize external HTML content
- Never render user input with dangerouslySetInnerHTML
- Validate all user input
- Keep dependencies updated
- Use secure dependencies (check CVE)
