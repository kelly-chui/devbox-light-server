import type { FileContent } from "./types.js";

export interface FileStorage {
  get(key: string): Promise<FileContent | undefined>;
  put(key: string, content: FileContent): Promise<void>;
  delete(key: string): Promise<boolean>;
}

export class FileStorageReadError extends Error {
  readonly name = "FileStorageReadError";
  constructor(options?: { cause?: unknown }) {
    super("File storage read failed.", options);
  }
}

export class FileStorageWriteError extends Error {
  readonly name = "FileStorageWriteError";
  constructor(options?: { cause?: unknown }) {
    super("File storage write failed.", options);
  }
}

export class PathTraversalError extends Error {
  readonly name = "PathTraversalError";
  constructor(readonly key: string) {
    super(`Path traversal detected: ${key}`);
  }
}
