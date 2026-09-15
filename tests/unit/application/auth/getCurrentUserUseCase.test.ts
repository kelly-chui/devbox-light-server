import { describe, expect, it } from "vitest";
import { createGetCurrentUserUseCase } from "../../../../src/application/auth/getCurrentUserUseCase.js";
import { InvalidTokenError } from "../../../../src/application/authErrors.js";
import { InMemoryTokenStore } from "../../../../src/data/auth/inMemoryTokenStore.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createGetCurrentUserUseCase", () => {
  it("returns the user associated with a token", async () => {
    const recordStore = new InMemoryRecordStore();
    const tokenStore = new InMemoryTokenStore();
    const getCurrentUser = createGetCurrentUserUseCase({ recordStore, tokenStore });
    const user = await recordStore.create("users", { name: "Bob" });
    await tokenStore.save("test-token", user.id);

    await expect(getCurrentUser("test-token")).resolves.toEqual(user);
  });

  it("throws InvalidTokenError for an invalid token", async () => {
    const getCurrentUser = createGetCurrentUserUseCase({
      recordStore: new InMemoryRecordStore(),
      tokenStore: new InMemoryTokenStore(),
    });

    await expect(getCurrentUser("invalid-token")).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
