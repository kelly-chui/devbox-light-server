import type { TokenStore } from "../../domain/auth/tokenStore.js";
import { mapTokenStoreError } from "./mapTokenStoreError.js";

export type LogoutUseCase = (token: string) => Promise<void>;

type LogoutUseCaseDependencies = {
  tokenStore: TokenStore;
};

export function createLogoutUseCase({
  tokenStore,
}: LogoutUseCaseDependencies): LogoutUseCase {
  return async (token) => {
    try {
      await tokenStore.remove(token);
    } catch (error) {
      throw mapTokenStoreError(error);
    }
  };
}
