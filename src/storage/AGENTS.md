---
trigger: glob
globs: src/storage/**
---

# Storage

The storage module provides file storage implementations.

Guidelines:

- Depend on the FileStorage interface.
- Keep implementations interchangeable.
- Store raw file content only.
- Metadata belongs outside the storage implementation unless explicitly required.
