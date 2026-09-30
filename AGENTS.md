# AGENTS.md

## Project Overview

This project is a lightweight development server for app development and local testing.

## Tech Stack

- TypeScript
- Express
- Vitest

## Project Goal

Provide an easy-to-run local HTTP mock server that lets applications develop and test integrations without a production backend.

## Project Principles

- Keep the codebase easy to understand.
- Prefer simplicity over production-grade complexity.
- Avoid infrastructure that is unnecessary for a lightweight development server.
- Keep modules small and focused.
- Prefer explicit behavior over magic.
- Avoid global mutable state.

## Task Management

Project work is tracked in `tasks/`.

- Read `tasks/README.md` before starting a non-trivial change.
- For work that can be reviewed as an independent PR, read its task card or create one from `tasks/TEMPLATE.md`.
- Update the task card's checkpoints, tests, details, and related commits when the work is complete.

## Module Boundaries

```text
src/
  api/           Express routes and middleware
  application/   Use cases
  domain/        Contracts, types, and domain errors
  data/          Implementations of domain contracts
  config/        Runtime configuration
  app.ts         Composition root
```

### Allowed Dependencies

- `api/` may depend on `application/` and `domain/`.
- `application/` may depend on `domain/`.
- `data/` may depend on `domain/`.
- `config/` may depend on `domain/` and `data/` to create runtime implementations.
- `domain/` must not depend on `api/`, `application/`, `data/`, or Express.
- `app.ts` composes `api/`, `application/`, `data/`, and `config/`.

### Architecture Rules

- Keep Express-specific code in `api/`.
- Put business behavior in `application/` use cases.
- Define replaceable contracts in `domain/`.
- Implement those contracts in `data/`.
- Pass concrete implementations into use cases from `app.ts`.

## Validation

- Run `npm test` after behavior changes.
- Run `npm run build` after TypeScript or build-configuration changes.

## Additional Guidance

### Codex Skills

- `testing` — Use when adding, updating, or debugging Vitest coverage.

### Workflows

- Read `.agents/workflows/implement-feature.md` before a non-trivial feature or module change.
