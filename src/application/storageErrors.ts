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

export class StorageError extends Error {
  constructor(options?: { cause?: unknown }) {
    super("Storage operation failed.", options);
    this.name = "StorageError";
  }
}
