import path from "node:path";
import {
  readJsonFile,
  runJsonFileOperation,
  writeJsonFile,
} from "../persistence/jsonFile.js";
import { InvalidTokenFileError } from "./authErrors.js";
import {
  TokenStoreReadError,
  TokenStoreWriteError,
  type TokenStore,
} from "../../domain/auth/tokenStore.js";

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
    try {
      const persisted = await readJsonFile(this.filePath);
      if (persisted !== undefined) {
        if (!isTokenMap(persisted)) {
          throw new InvalidTokenFileError(this.filePath);
        }
        return persisted;
      }
      return {};
    } catch (error) {
      throw new TokenStoreReadError({ cause: error });
    }
  }

  async save(token: string, userId: string): Promise<void> {
    await runJsonFileOperation(this.filePath, async () => {
      const tokens = await this.readTokens();
      tokens[token] = userId;
      try {
        await writeJsonFile(this.filePath, tokens);
      } catch (error) {
        throw new TokenStoreWriteError({ cause: error });
      }
    });
  }

  async getUserId(token: string): Promise<string | undefined> {
    const tokens = await this.readTokens();
    return tokens[token];
  }

  async remove(token: string): Promise<void> {
    await runJsonFileOperation(this.filePath, async () => {
      const tokens = await this.readTokens();
      if (tokens[token] !== undefined) {
        delete tokens[token];
        try {
          await writeJsonFile(this.filePath, tokens);
        } catch (error) {
          throw new TokenStoreWriteError({ cause: error });
        }
      }
    });
  }
}
