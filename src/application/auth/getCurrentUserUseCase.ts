import { InvalidTokenError } from "../authErrors.js";
import type { TokenStore } from "../../domain/auth/tokenStore.js";
import type { RecordStore } from "../../domain/db/recordStore.js";
import type { StoredRecord } from "../../domain/db/types.js";
import { mapRecordStoreError } from "../database/mapRecordStoreError.js";
import { mapTokenStoreError } from "./mapTokenStoreError.js";

export type GetCurrentUserUseCase = (token: string) => Promise<StoredRecord>;

type GetCurrentUserUseCaseDependencies = {
  recordStore: RecordStore;
  tokenStore: TokenStore;
};

export function createGetCurrentUserUseCase({
  recordStore,
  tokenStore,
}: GetCurrentUserUseCaseDependencies): GetCurrentUserUseCase {
  return async (token) => {
    let userId: string | undefined;
    try {
      userId = await tokenStore.getUserId(token);
    } catch (error) {
      throw mapTokenStoreError(error);
    }
    if (userId === undefined) {
      throw new InvalidTokenError();
    }

    let user: StoredRecord | undefined;
    try {
      user = await recordStore.get("users", userId);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
    if (user === undefined) {
      throw new InvalidTokenError();
    }
    return user;
  };
}
