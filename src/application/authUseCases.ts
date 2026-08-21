import { randomUUID } from "node:crypto";
import type { DatabaseUseCases } from "./databaseUseCases.js";
import { DatabaseRecordNotFoundError } from "./databaseErrors.js";
import type { StoredRecord } from "../domain/db/types.js";
import { UserNotFoundError, InvalidTokenError, AuthStorageError } from "./authErrors.js";
import {
  TokenStoreReadError,
  TokenStoreWriteError,
  type TokenStore,
} from "../domain/auth/tokenStore.js";

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
      try {
        await this.tokenStore.save(accessToken, user.id);
      } catch (error) {
        throw this.mapTokenStoreError(error);
      }
      return { accessToken, user };
    } catch (error) {
      if (error instanceof DatabaseRecordNotFoundError) {
        throw new UserNotFoundError(userId);
      }
      throw error;
    }
  }
  async getUserByToken(token: string): Promise<StoredRecord> {
    let userId: string | undefined;
    try {
      userId = await this.tokenStore.getUserId(token);
    } catch (error) {
      throw this.mapTokenStoreError(error);
    }
    if (!userId) {
      throw new InvalidTokenError();
    }
    try {
      return await this.databaseUseCases.getRecord("users", userId);
    } catch (error) {
      if (error instanceof DatabaseRecordNotFoundError) {
        throw new InvalidTokenError();
      }
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await this.tokenStore.remove(token);
    } catch (error) {
      throw this.mapTokenStoreError(error);
    }
  }

  private mapTokenStoreError(error: unknown): Error {
    if (
      error instanceof TokenStoreReadError ||
      error instanceof TokenStoreWriteError
    ) {
      return new AuthStorageError({ cause: error });
    }
    throw error;
  }
}
