import { describe, expect, it } from "vitest";
import { InMemoryTokenStore } from "../../../../src/data/auth/inMemoryTokenStore.js";

describe("InMemoryTokenStore", () => {
  it("saves and resolves user IDs by token", async () => {
    const store = new InMemoryTokenStore();
    await store.save("token-abc", "user-123");
    const userId = await store.getUserId("token-abc");
    expect(userId).toBe("user-123");
  });

  it("returns undefined for non-existent tokens", async () => {
    const store = new InMemoryTokenStore();
    const userId = await store.getUserId("invalid-token");
    expect(userId).toBeUndefined();
  });

  it("keeps token mappings isolated", async () => {
    const store = new InMemoryTokenStore();
    await store.save("token-a", "user-1");
    await store.save("token-b", "user-2");
    expect(await store.getUserId("token-a")).toBe("user-1");
    expect(await store.getUserId("token-b")).toBe("user-2");
  });

  it("removes tokens from the store", async () => {
    const store = new InMemoryTokenStore();
    await store.save("token-abc", "user-123");
    await store.remove("token-abc");
    expect(await store.getUserId("token-abc")).toBeUndefined();
  });
});
