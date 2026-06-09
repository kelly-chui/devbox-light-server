# Database Module

This module provides database-like record storage for the development server.

# Responsibilities

- Store and retrieve records.
- Define database-related contracts, types, and errors.
- Provide database implementations.
- Provide database HTTP endpoints.

# Non Responsibilities

This module must not handle:

- Authentication
- Authorization
- File storage
- Business-specific application rules
- ORM-style domain modeling

# Design

Database implementations should remain simple and predictable.

Avoid:

- ORM-style repositories
- Generic persistence frameworks
- Complex transaction systems

unless explicitly requested.

# Record Model

Records are grouped by collection.

A stored record contains:

- id
- data

The database implementation owns id generation.

The data field should remain generic and JSON-like.