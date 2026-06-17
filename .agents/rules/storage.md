---
trigger: glob
globs: src/storage/**
---

# Storage Module

## Responsibilities

- Define file storage contracts.
- Define storage-related types and errors.
- Provide file storage implementations.
- Provide storage-related use cases when needed.

## Non-Responsibilities

This module must not handle:

- Authentication
- Authorization
- Database record storage
- Business-specific application rules
- File metadata persistence

## Design

File storage contracts represent file content storage capabilities.

Storage services represent file storage use cases when workflow logic is required.

Storage implementations should remain simple, explicit, and replaceable.

Storage behavior should be predictable and easy to understand.

Public contracts should not expose implementation-specific storage details.

Local filesystem behavior should remain inside local storage implementations.

## Metadata

File metadata does not belong to the storage implementation.

Examples include:

- filename
- content type
- owner information
- creation timestamps
- application-specific attributes

Metadata should be managed by higher-level modules when needed.

## Avoid

Avoid introducing:

- Filesystem-specific concepts into public contracts
- Cloud-provider-specific APIs in contracts
- Media management frameworks
- Generic storage frameworks
- Complex lifecycle systems

unless explicitly requested.