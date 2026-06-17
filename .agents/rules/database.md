---
trigger: glob
globs: src/db/**
---

# Database Module

## Responsibilities

- Define record storage contracts.
- Define database-related types and errors.
- Provide record storage implementations.
- Provide database-related use cases when needed.

## Non-Responsibilities

This module must not handle:

- Authentication
- Authorization
- File storage
- Business-specific application rules
- ORM-style domain modeling

## Record Model

Records are grouped by collection.

A stored record contains:

- id
- data

The storage implementation owns id generation.

The data field should remain generic and JSON-like.

## Design

Record storage capabilities should remain simple and predictable.

Avoid:

- ORM-style domain models
- Generic persistence frameworks
- Complex transaction systems

unless explicitly requested.
