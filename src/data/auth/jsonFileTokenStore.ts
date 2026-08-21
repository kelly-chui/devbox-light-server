import path from "node:path";
import { readJsonFile, writeJsonFile } from "../persistence/jsonFile.js";
import { InvalidTokenFileError } from "../../domain/auth/errors.js";
import type { TokenStore } from "../../domain/auth/tokenStore.js";

type TokenMap = Record<string, string>;

function isTokenMap(value: unknown): value is TokenMap {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((userId) => typeof userId === "string")
  );
}

export class JsonFileTokenStore implements TokenStore {
  private readonly filePath: string;

  constructor(rootDirectory: string) {
    this.filePath = path.join(
      path.resolve(rootDirectory),
      "auth",
      "tokens.json",
    );
  }

  private async readTokens(): Promise<TokenMap> {
    const persisted = await readJsonFile(this.filePath);
    if (persisted !== undefined) {
      if (!isTokenMap(persisted)) {
        throw new InvalidTokenFileError(this.filePath);
      }
      return persisted;
    }
    return {};
  }

  async save(token: string, userId: string): Promise<void> {
    const tokens = await this.readTokens();
    tokens[token] = userId;
    await writeJsonFile(this.filePath, tokens);
  }

  async getUserId(token: string): Promise<string | undefined> {
    const tokens = await this.readTokens();
    return tokens[token];
  }

  async remove(token: string): Promise<void> {
    const tokens = await this.readTokens();
    if (tokens[token] !== undefined) {
      delete tokens[token];
      await writeJsonFile(this.filePath, tokens);
    }
  }
}
