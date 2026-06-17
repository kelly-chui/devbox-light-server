---
trigger: always_on
---

# Architecture

## Module Structure

- Organize code by module.
- Each module owns the files required for its responsibility.
- Modules should expose a clear public API through index.ts when appropriate.
- Avoid introducing new top-level architectural layers unless explicitly requested.

## Dependency Management

- Application code should depend on contracts rather than concrete implementations.
- Implementations should remain replaceable through clear contracts.
- Persistence should remain optional and swappable.
- Prefer introducing a service when multiple capabilities must be coordinated.

## Module Boundaries

- Each module should have a clear responsibility.
- Avoid mixing responsibilities between modules.
- Prefer using another module through its public interface.
- Avoid importing another module's implementation files directly.
