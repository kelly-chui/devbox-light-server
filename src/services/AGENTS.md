# Service Layer Guidelines

- Services should contain meaningful application logic.
- Avoid service layers that only forward calls to another abstraction.
- Keep abstraction boundaries small and easy to trace.
- Avoid unnecessary generic abstractions.

# Interfaces

- Application-level interfaces belong to the service layer when abstraction provides clear value.
- Prefer lightweight and project-specific contracts over reusable framework-style abstractions.
- Keep interfaces explicit and easy to trace.
- Prefer application-oriented naming over transport-oriented naming.
- Avoid generic wrapper names such as JsonRecord, RequestPayload, or ResponseData.
- Prefer neutral abstraction naming that does not assume a specific model or implementation detail.

# Architecture

- Service-level abstractions must not depend on Express.
- Concrete implementations that do not require abstraction may remain in the service layer.
- Prefer lightweight composition over layered indirection.
- Prefer direct usage of abstractions when no meaningful service logic exists.
- Keep dependency wiring explicit and easy to trace.

# Async

- Prefer async-await style APIs for asynchronous flows.
- Keep async flows explicit and easy to trace.
