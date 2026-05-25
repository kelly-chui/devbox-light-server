# Project Overview

This project is a lightweight development server for app development and local testing.
The project is closer to a mock server than a production backend.

# Development

- Use TypeScript.
- Use Express.
- Use Vitest for testing.
- Prefer explicit code over magic.
- Prefer readable code over clever code.
- Avoid unnecessary dependencies.
- Keep modules small and focused.

# Project Structure

- src/routes contains HTTP route definitions and request mapping.
- src/services contains application logic and service modules such as system and auth.
- src/db contains database implementations.
- src/storage contains file storage implementations.
- tests contains test files and test utilities.

# Architecture

- Routes should remain thin.
- Services should contain application logic.
- Services must not depend on Express.
- Persistence should remain optional and swappable.
- Implementations should remain replaceable through clear interfaces.

# Testing

- Keep tests lightweight and focused.
- Add tests for new services and infrastructure implementations when appropriate.
- Avoid unnecessary mocking.

# Error Handling

- Prefer explicit and predictable error handling.
- Avoid throwing raw strings.

# AI Guidance

- Prefer simpler solutions when possible.
- Avoid introducing unnecessary abstractions.
- Keep execution flow easy to trace.
