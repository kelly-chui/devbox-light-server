---
trigger: always_on
---

# Testing

## Principles

- Prefer unit tests.
- Keep tests deterministic and environment-independent.

## Scope

Prefer testing:

- services
- implementations

Avoid router tests unless the behavior being tested is specific to Express routing or middleware.

Avoid tests that depend on:

- localhost
- real sockets
- external services
