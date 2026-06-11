import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  LocalFileStorage,
  PathTraversalError,
} from "../../../src/storage/implementations/localFileStorage.js";

const encoder = new TextEncoder();

describe("LocalFileStorage", () => {
  let rootDirectory: string;
  let storage: LocalFileStorage;

  beforeEach(async () => {
    rootDirectory = await mkdtemp(path.join(tmpdir(), "local-file-storage-"));
    storage = new LocalFileStorage(rootDirectory);
  });

  afterEach(async () => {
    await rm(rootDirectory, { recursive: true, force: true });
  });

  it("stores and reads file content", async () => {
    const content = encoder.encode("hello");

    await storage.put("greeting.txt", content);

    expect(await storage.get("greeting.txt")).toEqual(content);
  });

  it("overwrites existing file content", async () => {
    await storage.put("greeting.txt", encoder.encode("first"));
    await storage.put("greeting.txt", encoder.encode("second"));

    expect(await storage.get("greeting.txt")).toEqual(encoder.encode("second"));
  });

  it("returns undefined for a missing file", async () => {
    expect(await storage.get("missing.txt")).toBeUndefined();
  });

  it("deletes existing files", async () => {
    await storage.put("greeting.txt", encoder.encode("hello"));

    expect(await storage.delete("greeting.txt")).toBe(true);
    expect(await storage.get("greeting.txt")).toBeUndefined();
  });

  it("returns false when deleting a missing file", async () => {
    expect(await storage.delete("missing.txt")).toBe(false);
  });

  it("supports nested keys and creates parent directories", async () => {
    const content = encoder.encode("nested");

    await storage.put("images/thumbnails/preview.png", content);

    const filePath = path.join(
      rootDirectory,
      "images",
      "thumbnails",
      "preview.png",
    );
    const onDisk = await readFile(filePath);

    expect(onDisk).toEqual(Buffer.from(content));
    expect(await storage.get("images/thumbnails/preview.png")).toEqual(
      content,
    );
  });

  it("rejects absolute keys", async () => {
    const absoluteKey = path.join(rootDirectory, "escape.txt");

    await expect(storage.put(absoluteKey, encoder.encode("nope"))).rejects.toBeInstanceOf(
      PathTraversalError,
    );
    await expect(storage.get(absoluteKey)).rejects.toBeInstanceOf(
      PathTraversalError,
    );
    await expect(storage.delete(absoluteKey)).rejects.toBeInstanceOf(
      PathTraversalError,
    );
  });

  it("rejects keys that escape the root directory", async () => {
    const traversalKeys = ["../escape.txt", "nested/../../escape.txt"];

    for (const key of traversalKeys) {
      await expect(
        storage.put(key, encoder.encode("nope")),
      ).rejects.toBeInstanceOf(PathTraversalError);
      await expect(storage.get(key)).rejects.toBeInstanceOf(PathTraversalError);
      await expect(storage.delete(key)).rejects.toBeInstanceOf(
        PathTraversalError,
      );
    }

    const escapePath = path.resolve(rootDirectory, "..", "escape.txt");
    expect(await readFile(escapePath).catch(() => null)).toBeNull();
  });
});
