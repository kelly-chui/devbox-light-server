import type { TokenStore } from "../../domain/auth/tokenStore.js";

export class InMemoryTokenStore implements TokenStore {
  private readonly tokens = new Map<string, string>();

  async save(token: string, userId: string): Promise<void> {
    this.tokens.set(token, userId);
  }

  async getUserId(token: string): Promise<string | undefined> {
    return this.tokens.get(token);
  }

  async remove(token: string): Promise<void> {
    this.tokens.delete(token);
  }
}

