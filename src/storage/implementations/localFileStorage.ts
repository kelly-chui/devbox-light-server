import fs from "node:fs/promises";
import path from "node:path";
import type { FileStorage } from "../fileStorage.js";
import type { FileContent } from "../types.js";

export class PathTraversalError extends Error {
  readonly name = "PathTraversalError";

  constructor(readonly key: string) {
    super(`Path traversal detected: ${key}`);
  }
}

export class LocalFileStorage implements FileStorage {
  private readonly rootDirectory: string;

  constructor(rootDirectory: string) {
    this.rootDirectory = path.resolve(rootDirectory);
  }

  private resolveFilePath(key: string): string {
    if (path.isAbsolute(key)) {
      throw new PathTraversalError(key);
    }

    const filePath = path.resolve(this.rootDirectory, key);
    const relative = path.relative(this.rootDirectory, filePath);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new PathTraversalError(key);
    }

    return filePath;
  }

  async get(key: string): Promise<FileContent | undefined> {
    const filePath = this.resolveFilePath(key);

    try {
      const content = await fs.readFile(filePath);
      return new Uint8Array(content);
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async put(key: string, content: FileContent): Promise<void> {
    const filePath = this.resolveFilePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
  }

  async delete(key: string): Promise<boolean> {
    const filePath = this.resolveFilePath(key);

    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
  );
}
