import { describe, expect, it } from "vitest";
import { createLoginUseCase } from "../../../../src/application/auth/loginUseCase.js";
import { UserNotFoundError } from "../../../../src/application/authErrors.js";
import { InMemoryTokenStore } from "../../../../src/data/auth/inMemoryTokenStore.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createLoginUseCase", () => {
  it("returns a token and the existing user", async () => {
    const recordStore = new InMemoryRecordStore();
    const tokenStore = new InMemoryTokenStore();
    const login = createLoginUseCase({
      recordStore,
      tokenStore,
      createToken: () => "test-token",
    });
    const user = await recordStore.create("users", { name: "Bob" });

    await expect(login(user.id)).resolves.toEqual({
      accessToken: "test-token",
      user,
    });
    await expect(tokenStore.getUserId("test-token")).resolves.toBe(user.id);
  });

  it("throws UserNotFoundError for a missing user", async () => {
    const login = createLoginUseCase({
      recordStore: new InMemoryRecordStore(),
      tokenStore: new InMemoryTokenStore(),
      createToken: () => "test-token",
    });

    await expect(login("missing-user")).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
