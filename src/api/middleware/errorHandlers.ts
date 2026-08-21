import type { ErrorRequestHandler, RequestHandler } from "express";
import { MulterError } from "multer";

function hasErrorType(error: unknown, type: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === type
  );
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "not_found" });
};

export const jsonErrorHandler: ErrorRequestHandler = (
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

  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "payload_too_large" });
      return;
    }

    res.status(400).json({ error: "invalid_file" });
    return;
  }

  console.error("Unhandled request error", error);
  res.status(500).json({ error: "internal_server_error" });
};
