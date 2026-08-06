---
trigger: always_on
---

# Architecture

## Dependency direction

Application code should depend on interfaces rather than concrete implementations.

```
Route
↓
Service
↓
Interface
↓
Implementation
```
- Keep Express concerns inside routes.
- Business logic belongs in services.
- Storage and database implementations should be replaceable.
- Avoid global mutable state.
- Prefer dependency injection from `src/app.ts`.

## Design principles

- Small, focused modules.
- Explicit behavior over magic.
- Composition over inheritance.
