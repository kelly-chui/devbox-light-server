---
trigger: glob
globs: src/db/**
---

# Database

The database module provides RecordStore implementations.

Guidelines:

- Services interact with RecordStore interfaces.
- RecordStore implementations should not contain business logic.
- Generate record IDs inside the store.
- Keep implementations interchangeable.
- Preserve deterministic behavior for testing.
