export class FileNotFoundError extends Error {
  readonly name = "FileNotFoundError";

  constructor(readonly key: string) {
    super(`File not found: ${key}`);
  }
}

export class PathTraversalError extends Error {
  readonly name = "PathTraversalError";

  constructor(readonly key: string) {
    super(`Path traversal detected: ${key}`);
  }
}
