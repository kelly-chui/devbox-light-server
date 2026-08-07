import { randomUUID } from "node:crypto";
import type { DatabaseService } from "../db/databaseService.js";
import { RecordNotFoundError } from "../db/errors.js";
import type { StoredRecord } from "../db/types.js";
import { UserNotFoundError, InvalidTokenError } from "./errors.js";
import type { TokenStore } from "./tokenStore.js";

export class AuthService {
  private readonly databaseService: DatabaseService;
  private readonly tokenStore: TokenStore;

  constructor(databaseService: DatabaseService, tokenStore: TokenStore) {
    this.databaseService = databaseService;
    this.tokenStore = tokenStore;
  }

  async login(
    userId: string,
  ): Promise<{ accessToken: string; user: StoredRecord }> {
    try {
      const user = await this.databaseService.getRecord("users", userId);
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
      return await this.databaseService.getRecord("users", userId);
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