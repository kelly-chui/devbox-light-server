import { describe, expect, it } from "vitest";
import { AuthUseCases } from "../../../src/application/authUseCases.js";
import {
  InvalidTokenError,
  UserNotFoundError,
} from "../../../src/application/authErrors.js";
import { InMemoryTokenStore } from "../../../src/data/auth/inMemoryTokenStore.js";
import { DatabaseUseCases } from "../../../src/application/databaseUseCases.js";
import { InMemoryRecordStore } from "../../../src/data/db/inMemoryRecordStore.js";

describe("AuthUseCases", () => {
  it("authenticates existing user and returns access token", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseUseCases = new DatabaseUseCases(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authUseCases = new AuthUseCases(databaseUseCases, tokenStore);

    const userRecord = await databaseUseCases.createRecord("users", {
      name: "Bob",
      email: "bob@example.com",
    });

    const result = await authUseCases.login(userRecord.id);

    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe("string");
    expect(result.user).toEqual(userRecord);

    const resolvedUser = await authUseCases.getUserByToken(result.accessToken);
    expect(resolvedUser).toEqual(userRecord);
  });

  it("throws UserNotFoundError when logging in with missing user ID", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseUseCases = new DatabaseUseCases(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authUseCases = new AuthUseCases(databaseUseCases, tokenStore);

    await expect(
      authUseCases.login("non-existent-user-id"),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("resolves tokens to the correct authenticated user", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseUseCases = new DatabaseUseCases(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authUseCases = new AuthUseCases(databaseUseCases, tokenStore);

    const user1 = await databaseUseCases.createRecord("users", { name: "User 1" });
    const user2 = await databaseUseCases.createRecord("users", { name: "User 2" });

    const login1 = await authUseCases.login(user1.id);
    const login2 = await authUseCases.login(user2.id);

    expect(await authUseCases.getUserByToken(login1.accessToken)).toEqual(user1);
    expect(await authUseCases.getUserByToken(login2.accessToken)).toEqual(user2);
  });

  it("throws InvalidTokenError for an invalid or unregistered token", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseUseCases = new DatabaseUseCases(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authUseCases = new AuthUseCases(databaseUseCases, tokenStore);

    await expect(
      authUseCases.getUserByToken("invalid-or-unregistered-token"),
    ).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it("invalidates tokens upon logout", async () => {
    const recordStore = new InMemoryRecordStore();
    const databaseUseCases = new DatabaseUseCases(recordStore);
    const tokenStore = new InMemoryTokenStore();
    const authUseCases = new AuthUseCases(databaseUseCases, tokenStore);

    const user = await databaseUseCases.createRecord("users", { name: "Alice" });
    const { accessToken } = await authUseCases.login(user.id);

    expect(await authUseCases.getUserByToken(accessToken)).toEqual(user);

    await authUseCases.logout(accessToken);

    await expect(authUseCases.getUserByToken(accessToken)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
