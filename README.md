# @ciscode/api-kit

Typed HTTP client for TypeScript applications. Wraps Axios internally and exposes
a clean, strongly-typed API with zero Axios types in the public surface.

## Features

- Typed `get`, `post`, `put`, `patch`, `delete` methods returning `Promise<T>`
- Built-in auth token injection via `getToken`
- Composable request, response, and error interceptors
- `ApiError` class with `status`, `code`, `message`, and `details`
- Configurable retry with exponential backoff
- No Axios types leak to consumers

## Installation

```bash
npm install @ciscode/api-kit
```

## Quick Start

```ts
import { createApiClient } from '@ciscode/api-kit';

const api = createApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

const users = await api.get<User[]>('/users');
```

## Configuration

`createApiClient(config)` accepts the following options:

| Option       | Type                     | Default      | Description                             |
| ------------ | ------------------------ | ------------ | --------------------------------------- |
| `baseURL`    | `string`                 | _(required)_ | Base URL for all requests               |
| `timeout`    | `number`                 | `undefined`  | Request timeout in milliseconds         |
| `headers`    | `Record<string, string>` | `undefined`  | Default headers for every request       |
| `getToken`   | `() => string \| null`   | `undefined`  | Token provider for Authorization header |
| `retry`      | `number`                 | `0`          | Number of retry attempts                |
| `retryDelay` | `number`                 | `500`        | Base delay in ms (doubles each attempt) |

## HTTP Methods

All methods accept an optional generic type parameter and return `Promise<T>`.

```ts
// GET
const user = await api.get<User>('/users/1');

// GET with query params and abort signal
const controller = new AbortController();
const users = await api.get<User[]>('/users', {
  params: { page: 1, limit: 10 },
  signal: controller.signal,
});

// POST
const created = await api.post<User>('/users', { name: 'Jane' });

// PUT
const updated = await api.put<User>('/users/1', { name: 'Jane Doe' });

// PATCH
const patched = await api.patch<User>('/users/1', { name: 'Jane' });

// DELETE
const result = await api.delete<{ success: boolean }>('/users/1');
```

### Per-Request Config

Every method accepts an optional `RequestConfig`:

```ts
await api.get('/data', {
  headers: { 'X-Custom': 'value' },
  params: { query: 'search' },
  signal: abortController.signal,
});
```

## Auth Token Injection

Provide a `getToken` function to automatically inject `Authorization: Bearer <token>`
on every request. When `getToken` returns `null`, the header is silently skipped.

```ts
const api = createApiClient({
  baseURL: 'https://api.example.com',
  getToken: () => localStorage.getItem('access_token'),
});

// Authorization header is injected automatically
const profile = await api.get<Profile>('/me');
```

## Interceptors

Register composable interceptors that execute in registration order.

```ts
// Request interceptor — add correlation ID
api.addRequestInterceptor((req) => {
  req.headers['X-Request-Id'] = crypto.randomUUID();
  return req;
});

// Response interceptor — log responses
api.addResponseInterceptor((res) => {
  console.log(`[${res.status}]`, res.data);
  return res;
});

// Error interceptor — report errors
api.addErrorInterceptor((error) => {
  console.error('API error:', error.message);
});
```

## Error Handling

All HTTP errors are normalized into `ApiError` instances. No Axios error types
reach consumer code.

```ts
import { createApiClient, ApiError } from '@ciscode/api-kit';

try {
  await api.get('/protected');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status); // 404
    console.error(error.code); // "HTTP_404"
    console.error(error.message); // "Not Found"
    console.error(error.details); // response body (if any)
  }
}
```

Network errors produce `status: 0` and `code: "NETWORK_ERROR"`.

## Retry with Exponential Backoff

Configure automatic retries for transient failures. Only retryable status codes
are retried: `408`, `429`, `500`, `502`, `503`, `504`. Other errors (e.g. `400`,
`401`, `403`, `404`) fail immediately.

```ts
const api = createApiClient({
  baseURL: 'https://api.example.com',
  retry: 3, // up to 3 retry attempts
  retryDelay: 500, // 500ms, 1000ms, 2000ms (doubles each attempt)
});
```

Backoff formula: `retryDelay * 2^attempt`

## License

MIT
