import type { RequestHandler } from "express";

const DEFAULT_CORS_ORIGIN = "*";
const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Authorization,Content-Type";

export function readCorsOrigin(value: string | undefined): string {
  const origin = value?.trim();
  return origin ? origin : DEFAULT_CORS_ORIGIN;
}

export function createCorsMiddleware(origin: string): RequestHandler {
  return (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
    res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    next();
  };
}
