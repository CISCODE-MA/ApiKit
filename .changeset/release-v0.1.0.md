---
'@ciscode/api-kit': minor
---

Initial release of @ciscode/api-kit v0.1.0

- `createApiClient` factory with typed `get`, `post`, `put`, `patch`, `delete` methods
- Built-in auth token injection via `getToken` config
- Composable request, response, and error interceptors
- `ApiError` class normalizing all HTTP/network errors
- Configurable retry with exponential backoff
