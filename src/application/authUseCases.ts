import { randomUUID } from "node:crypto";
import type { DatabaseUseCases } from "./databaseUseCases.js";
import { RecordNotFoundError } from "../domain/db/errors.js";
import type { StoredRecord } from "../domain/db/types.js";
import { UserNotFoundError, InvalidTokenError } from "../domain/auth/errors.js";
import type { TokenStore } from "../domain/auth/tokenStore.js";

export class AuthUseCases {
  private readonly databaseUseCases: DatabaseUseCases;
  private readonly tokenStore: TokenStore;

  constructor(databaseUseCases: DatabaseUseCases, tokenStore: TokenStore) {
    this.databaseUseCases = databaseUseCases;
    this.tokenStore = tokenStore;
  }

  async login(
    userId: string,
  ): Promise<{ accessToken: string; user: StoredRecord }> {
    try {
      const user = await this.databaseUseCases.getRecord("users", userId);
      const accessToken = randomUUID();
      await this.tokenStore.save(accessToken, user.id);
      return { accessToken, user };
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        throw new UserNotFoundError(userId);
      }
      throw error;
    }
  }
  async getUserByToken(token: string): Promise<StoredRecord> {
    const userId = await this.tokenStore.getUserId(token);
    if (!userId) {
      throw new InvalidTokenError();
    }
    try {
      return await this.databaseUseCases.getRecord("users", userId);
    } catch (error) {
      if (error instanceof RecordNotFoundError) {
        throw new InvalidTokenError();
      }
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    await this.tokenStore.remove(token);
  }
}
