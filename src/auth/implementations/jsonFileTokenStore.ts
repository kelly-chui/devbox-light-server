import path from "node:path";
import { readJsonFile, writeJsonFile } from "../../util/jsonFile.js";
import { InvalidTokenFileError } from "../errors.js";
import type { TokenStore } from "../tokenStore.js";

type TokenMap = Record<string, string>;

function isTokenMap(value: unknown): value is TokenMap {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class JsonFileTokenStore implements TokenStore {
  private readonly filePath: string;
  private tokens: TokenMap = {};
  private loaded = false;

  constructor(rootDirectory: string) {
    this.filePath = path.join(
      path.resolve(rootDirectory),
      "auth",
      "tokens.json",
    );
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }
    const persisted = await readJsonFile(this.filePath);
    if (persisted !== undefined) {
      if (!isTokenMap(persisted)) {
        throw new InvalidTokenFileError(this.filePath);
      }
      this.tokens = persisted;
    }
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    await writeJsonFile(this.filePath, this.tokens);
  }

  async save(token: string, userId: string): Promise<void> {
    await this.ensureLoaded();
    this.tokens[token] = userId;
    await this.persist();
  }

  async getUserId(token: string): Promise<string | undefined> {
    await this.ensureLoaded();
    return this.tokens[token];
  }

  async remove(token: string): Promise<void> {
    await this.ensureLoaded();
    if (this.tokens[token] !== undefined) {
      delete this.tokens[token];
      await this.persist();
    }
  }
}
