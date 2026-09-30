---
name: testing
description: Add, update, or debug Vitest coverage for DevBox behavior, including API contracts, use cases, and data implementations.
---

# Testing

- Put API-level behavior in `tests/integration/httpContract.test.ts`.
- Put focused configuration, application, domain, or data tests under `tests/unit/`, mirroring the source area when practical.
- Test observable behavior, including important success and failure cases, rather than implementation details.
- Prefer unit tests. Use HTTP contract tests for public endpoint behavior, middleware, error responses, CORS, and multipart uploads.
- Keep setup local and deterministic. Avoid unnecessary mocks and external dependencies.
- Run the most focused test first, then `npm test` when the scope warrants it.
