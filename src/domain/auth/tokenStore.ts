export interface TokenStore {
  save(token: string, userId: string): Promise<void>;
  getUserId(token: string): Promise<string | undefined>;
  remove(token: string): Promise<void>;
}

export class TokenStoreReadError extends Error {
  readonly name = "TokenStoreReadError";
  constructor(options?: { cause?: unknown }) {
    super("Token store read failed.", options);
  }
}

export class TokenStoreWriteError extends Error {
  readonly name = "TokenStoreWriteError";
  constructor(options?: { cause?: unknown }) {
    super("Token store write failed.", options);
  }
}
