---
trigger: always_on
---

# Express Architecture

- Route files are responsible only for HTTP request and response mapping.
- Route files should remain thin.
- Application logic must not depend on Express.
- Services should contain use-case and application workflow logic when needed.
- Dependency wiring should happen in src/app.ts.
