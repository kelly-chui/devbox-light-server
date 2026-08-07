import { describe, expect, it } from "vitest";
import { AuthService } from "../../../src/auth/authService.js";
import {
  InvalidTokenError,
  UserNotFoundError,
} from "../../../src/auth/errors.js";
import { InMemoryTokenStore } from "../../../src/auth/implementations/inMemoryTokenStore.js";
import { DatabaseService } from "../../../src/db/databaseService.js";
import { InMemoryRecordStore } from "../../../src/db/implementations/inMemoryRecordStore.js";

describe("AuthService", () => {
  it("authenticates existing user and returns access token", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseService = new DatabaseService(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authService = new AuthService(databaseService, tokenStore);

    const userRecord = await databaseService.createRecord("users", {
      name: "Bob",
      email: "bob@example.com",
    });

    const result = await authService.login(userRecord.id);

    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe("string");
    expect(result.user).toEqual(userRecord);

    const resolvedUser = await authService.getUserByToken(result.accessToken);
    expect(resolvedUser).toEqual(userRecord);
  });

  it("throws UserNotFoundError when logging in with missing user ID", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseService = new DatabaseService(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authService = new AuthService(databaseService, tokenStore);

    await expect(
      authService.login("non-existent-user-id"),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("resolves tokens to the correct authenticated user", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseService = new DatabaseService(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authService = new AuthService(databaseService, tokenStore);

    const user1 = await databaseService.createRecord("users", { name: "User 1" });
    const user2 = await databaseService.createRecord("users", { name: "User 2" });

    const login1 = await authService.login(user1.id);
    const login2 = await authService.login(user2.id);

    expect(await authService.getUserByToken(login1.accessToken)).toEqual(user1);
    expect(await authService.getUserByToken(login2.accessToken)).toEqual(user2);
  });

  it("throws InvalidTokenError for an invalid or unregistered token", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseService = new DatabaseService(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authService = new AuthService(databaseService, tokenStore);

    await expect(
      authService.getUserByToken("invalid-or-unregistered-token"),
    ).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it("invalidates tokens upon logout", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseService = new DatabaseService(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authService = new AuthService(databaseService, tokenStore);

    const user = await databaseService.createRecord("users", { name: "Alice" });
    const { accessToken } = await authService.login(user.id);

    expect(await authService.getUserByToken(accessToken)).toEqual(user);

    await authService.logout(accessToken);

    await expect(authService.getUserByToken(accessToken)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});

