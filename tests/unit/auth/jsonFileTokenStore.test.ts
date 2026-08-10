import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JsonFileTokenStore } from "../../../src/auth/implementations/jsonFileTokenStore.js";

describe("JsonFileTokenStore", () => {
  let rootDirectory: string;
  let store: JsonFileTokenStore;

  beforeEach(async () => {
    rootDirectory = await mkdtemp(path.join(tmpdir(), "json-token-"));
    store = new JsonFileTokenStore(rootDirectory);
  });

  afterEach(async () => {
    await rm(rootDirectory, { recursive: true, force: true });
  });

  it("saves and resolves user IDs by token", async () => {
    await store.save("token-abc", "user-123");

    expect(await store.getUserId("token-abc")).toBe("user-123");
  });

  it("returns undefined for non-existent tokens", async () => {
    expect(await store.getUserId("invalid-token")).toBeUndefined();
  });

  it("keeps token mappings isolated", async () => {
    await store.save("token-a", "user-1");
    await store.save("token-b", "user-2");

    expect(await store.getUserId("token-a")).toBe("user-1");
    expect(await store.getUserId("token-b")).toBe("user-2");
  });

  it("removes tokens from the store", async () => {
    await store.save("token-abc", "user-123");

    await store.remove("token-abc");

    expect(await store.getUserId("token-abc")).toBeUndefined();
  });

  it("persists tokens across instances", async () => {
    await store.save("token-abc", "user-123");

    const reloaded = new JsonFileTokenStore(rootDirectory);

    expect(await reloaded.getUserId("token-abc")).toBe("user-123");
  });

  it("persists removals across instances", async () => {
    await store.save("token-abc", "user-123");
    await store.remove("token-abc");

    const reloaded = new JsonFileTokenStore(rootDirectory);

    expect(await reloaded.getUserId("token-abc")).toBeUndefined();
  });

  it("reads the current file contents for every operation", async () => {
    await store.save("token-abc", "user-123");
    await writeFile(
      path.join(rootDirectory, "auth", "tokens.json"),
      JSON.stringify({ "token-abc": "user-updated" }),
    );

    expect(await store.getUserId("token-abc")).toBe("user-updated");
  });
});
