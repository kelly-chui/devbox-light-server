# Database Implementation Guidelines

- src/db contains concrete database implementations.
- Database implementations should remain replaceable through the Database interface.
- Keep implementations explicit and easy to trace.
- Prefer simple storage logic over framework-style abstractions.
- Avoid ORM-like behavior unless explicitly required.

# Storage Behavior

- Keep persistence behavior predictable and explicit.
- Avoid hidden mutations or implicit behavior.
- Prefer straightforward CRUD flows over abstraction-heavy query systems.

# Architecture

- Database implementations must not depend on Express.
- Keep implementation-specific logic inside src/db.
- Avoid leaking storage-specific behavior into service-level contracts.
- Prefer composition over inheritance.

# Async

- Use async-await style APIs for asynchronous flows.
- Keep async flows easy to trace.

# Testing

- Database implementations should be easy to test in isolation.
- Prefer lightweight tests with explicit setup and teardown.
- Avoid unnecessary mocking.

# AI Guidance

- Do not introduce ORM-style repositories or query builders unless explicitly requested.
- Avoid excessive generic abstractions.
- Prefer readable implementation code over reusable framework patterns.
