import { describe, expect, it } from "vitest";
import { createLogoutUseCase } from "../../../../src/application/auth/logoutUseCase.js";
import { InMemoryTokenStore } from "../../../../src/data/auth/inMemoryTokenStore.js";

describe("createLogoutUseCase", () => {
  it("removes a token", async () => {
    const tokenStore = new InMemoryTokenStore();
    const logout = createLogoutUseCase({ tokenStore });
    await tokenStore.save("test-token", "user-id");

    await logout("test-token");

    await expect(tokenStore.getUserId("test-token")).resolves.toBeUndefined();
  });
});
