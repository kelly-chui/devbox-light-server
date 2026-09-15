import type { StoredRecord } from "../../domain/db/types.js";
import type { RecordStore } from "../../domain/db/recordStore.js";
import type { TokenStore } from "../../domain/auth/tokenStore.js";
import { UserNotFoundError } from "../authErrors.js";
import { mapRecordStoreError } from "../database/mapRecordStoreError.js";
import { mapTokenStoreError } from "./mapTokenStoreError.js";

export type LoginResult = {
  accessToken: string;
  user: StoredRecord;
};

export type LoginUseCase = (userId: string) => Promise<LoginResult>;

type LoginUseCaseDependencies = {
  recordStore: RecordStore;
  tokenStore: TokenStore;
  createToken: () => string;
};

export function createLoginUseCase({
  recordStore,
  tokenStore,
  createToken,
}: LoginUseCaseDependencies): LoginUseCase {
  return async (userId) => {
    let user: StoredRecord | undefined;
    try {
      user = await recordStore.get("users", userId);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
    if (user === undefined) {
      throw new UserNotFoundError(userId);
    }

    const accessToken = createToken();
    try {
      await tokenStore.save(accessToken, user.id);
    } catch (error) {
      throw mapTokenStoreError(error);
    }
    return { accessToken, user };
  };
}
