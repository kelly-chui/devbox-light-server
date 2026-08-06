---
name: testing-kill
description: Use when adding, updating, or debugging tests in this TypeScript/Vitest project.
---

# Testing

Before writing tests:

1. Read the relevant source code and existing tests.
2. Follow the existing test structure and conventions.
3. Identify the behavior being tested rather than mirroring implementation details.

When writing tests:

- Prefer focused unit tests.
- Test observable behavior through the public interface.
- Cover important success and failure cases.
- Keep setup minimal and local to the test when practical.
- Reuse existing test helpers when they improve clarity.
- Avoid unnecessary mocks.
- Do not introduce timing, network, filesystem, or environment dependencies unless the behavior specifically requires them.

After changing tests:

1. Run the most relevant tests first.
2. Fix failures caused by the change.
3. Run the broader test suite when the scope warrants it.
