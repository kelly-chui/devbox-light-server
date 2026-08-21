import type { ErrorRequestHandler, RequestHandler } from "express";

function hasErrorType(error: unknown, type: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === type
  );
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "route_not_found" });
};

export const httpErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (hasErrorType(error, "entity.parse.failed")) {
    res.status(400).json({ error: "invalid_json" });
    return;
  }

  if (hasErrorType(error, "entity.too.large")) {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }

  console.error("Unhandled request error", error);
  res.status(500).json({ error: "internal_server_error" });
};
