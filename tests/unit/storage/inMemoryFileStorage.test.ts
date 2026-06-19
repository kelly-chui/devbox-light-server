import { describe, expect, it } from "vitest";
import { InMemoryFileStorage } from "../../../src/storage/implementations/inMemoryFileStorage.js";

describe("InMemoryFileStorage", () => {
  it("stores and retrieves file content", async () => {
    const storage = new InMemoryFileStorage();
    const data = new Uint8Array([1, 2, 3]);

    await storage.put("file.bin", data);
    const retrieved = await storage.get("file.bin");

    expect(retrieved).toEqual(data);
  });

  it("returns undefined for a missing file", async () => {
    const storage = new InMemoryFileStorage();
    expect(await storage.get("missing.bin")).toBeUndefined();
  });

  it("deletes existing files", async () => {
    const storage = new InMemoryFileStorage();
    const data = new Uint8Array([1, 2, 3]);

    await storage.put("file.bin", data);
    expect(await storage.delete("file.bin")).toBe(true);
    expect(await storage.get("file.bin")).toBeUndefined();
  });

  it("returns false when deleting a missing file", async () => {
    const storage = new InMemoryFileStorage();
    expect(await storage.delete("missing.bin")).toBe(false);
  });

  it("does not leak references on put (defensive copying)", async () => {
    const storage = new InMemoryFileStorage();
    const data = new Uint8Array([1, 2, 3]);

    await storage.put("file.bin", data);
    data[0] = 99; // Mutate original source array

    const retrieved = await storage.get("file.bin");
    expect(retrieved).toEqual(new Uint8Array([1, 2, 3])); // Should remain unchanged
  });

  it("does not leak references on get (defensive copying)", async () => {
    const storage = new InMemoryFileStorage();
    const data = new Uint8Array([1, 2, 3]);

    await storage.put("file.bin", data);
    const retrieved = await storage.get("file.bin");
    expect(retrieved).toBeDefined();

    retrieved![0] = 99; // Mutate retrieved array

    const retrievedAgain = await storage.get("file.bin");
    expect(retrievedAgain).toEqual(new Uint8Array([1, 2, 3])); // Should remain unchanged
  });
});
