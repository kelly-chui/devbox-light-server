# Route Layer Guidelines

- Routes should remain thin.
- Routes are responsible for HTTP request and response handling.
- Keep request validation explicit and easy to trace.
- Prefer straightforward route handlers over abstract routing helpers.
- Avoid moving application logic into routes.
- Prefer small local helper functions over reusable routing frameworks.
