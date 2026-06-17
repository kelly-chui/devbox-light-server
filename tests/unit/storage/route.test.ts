import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { createStorageRouter } from "../../../src/storage/route.js";
import { StorageService } from "../../../src/storage/storageService.js";
import { PathTraversalError } from "../../../src/storage/errors.js";
import type { FileStorage } from "../../../src/storage/fileStorage.js";

// A mock file storage for testing route behavior
class MockFileStorage implements FileStorage {
  async get(key: string) {
    if (key === "traversal") {
      throw new PathTraversalError("nested/../../escape.txt");
    }
    if (key === "missing.txt") {
      return undefined;
    }
    return new TextEncoder().encode("mock content");
  }
  async put(key: string, content: Uint8Array) {}
  async delete(key: string) {
    if (key === "missing.txt") {
      return false;
    }
    return true;
  }
}

describe("Storage HTTP API Router", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(() => {
    const app = express();
    const storageService = new StorageService(new MockFileStorage());
    app.use("/files", createStorageRouter(storageService));

    return new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("handles GET requests successfully", async () => {
    const res = await fetch(`${baseUrl}/files/test.txt`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    const text = await res.text();
    expect(text).toBe("mock content");
  });

  it("handles PUT requests successfully", async () => {
    const res = await fetch(`${baseUrl}/files/test.txt`, {
      method: "PUT",
      body: "new content",
      headers: { "Content-Type": "text/plain" },
    });
    expect(res.status).toBe(204);
  });

  it("handles DELETE requests successfully", async () => {
    const res = await fetch(`${baseUrl}/files/test.txt`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);
  });

  it("returns 400 for empty keys", async () => {
    const res = await fetch(`${baseUrl}/files/`);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "invalid_key" });
  });

  it("returns 404 for FileNotFoundError", async () => {
    const res = await fetch(`${baseUrl}/files/missing.txt`);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({
      error: "not_found",
      key: "missing.txt",
    });
  });

  it("returns 400 for PathTraversalError", async () => {
    const res = await fetch(`${baseUrl}/files/traversal`);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({
      error: "path_traversal",
      key: "nested/../../escape.txt",
    });
  });
});
