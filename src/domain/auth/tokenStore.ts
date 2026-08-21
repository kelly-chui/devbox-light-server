export interface TokenStore {
  save(token: string, userId: string): Promise<void>;
  getUserId(token: string): Promise<string | undefined>;
  remove(token: string): Promise<void>;
}

