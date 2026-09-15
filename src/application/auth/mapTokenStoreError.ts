import {
  TokenStoreReadError,
  TokenStoreWriteError,
} from "../../domain/auth/tokenStore.js";
import { AuthStorageError } from "../authErrors.js";

export function mapTokenStoreError(error: unknown): Error {
  if (
    error instanceof TokenStoreReadError ||
    error instanceof TokenStoreWriteError
  ) {
    return new AuthStorageError({ cause: error });
  }
  return error instanceof Error ? error : new Error("Unknown token store error.");
}
