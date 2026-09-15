import type { FileStorage } from "../../domain/storage/fileStorage.js";
import { FileNotFoundError } from "../storageErrors.js";
import { mapFileStorageError } from "./mapFileStorageError.js";

export type DeleteFileUseCase = (key: string) => Promise<void>;

export function createDeleteFileUseCase({
  fileStorage,
}: { fileStorage: FileStorage }): DeleteFileUseCase {
  return async (key) => {
    let deleted: boolean;
    try {
      deleted = await fileStorage.delete(key);
    } catch (error) {
      throw mapFileStorageError(error);
    }
    if (!deleted) {
      throw new FileNotFoundError(key);
    }
  };
}
