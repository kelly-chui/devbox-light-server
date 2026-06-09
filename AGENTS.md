# Project Overview

This project is a lightweight development server for app development and local testing.

The project is closer to a mock server than a production backend.

# Technology

- Use TypeScript.
- Use Express.
- Use Vitest for testing.

# Development Principles

- Prefer explicit code over magic.
- Prefer readable code over clever code.
- Avoid unnecessary dependencies.
- Keep modules small and focused.
- Keep execution flow easy to trace.
- Prefer composition over inheritance.

# Project Structure

- Organize code by module.
- Each module owns the files required for its responsibility.
- Modules should expose a clear public API through `index.ts` when appropriate.
- Avoid introducing new top-level architectural layers unless explicitly required.

# Architecture

- Route files are responsible for HTTP request and response mapping only.
- Route files should remain thin.
- Application logic must not depend on Express.
- Dependency wiring should happen in `src/app.ts`.
- Application code should depend on contracts rather than concrete implementations.
- Implementations should remain replaceable through clear interfaces.
- Persistence should remain optional and swappable.

# Module Boundaries

- Each module should have a clear responsibility.
- Avoid mixing responsibilities between modules.
- Prefer using another module through its public interface or exported API.
- Avoid importing another module's implementation files directly.
- Put module-specific rules in that module's own AGENTS.md.

# Testing

- Keep tests lightweight and focused.
- Prefer explicit test setup over complex fixtures.
- Avoid unnecessary mocking.
- Unit tests should verify behavior, not implementation details.

# Error Handling

- Prefer explicit and predictable error handling.
- Avoid throwing raw strings.
- Prefer domain-specific error types when appropriate.

# AI Guidance

- Prefer simpler solutions when possible.
- Avoid introducing unnecessary abstractions.
- Avoid framework-style architectures unless explicitly requested.
- Do not create or modify AGENTS.md files unless explicitly requested.
- Do not generate architecture documentation automatically.
