import type { FileStorage } from "../../domain/storage/fileStorage.js";
import type { FileContent } from "../../domain/storage/types.js";
import { mapFileStorageError } from "./mapFileStorageError.js";

export type PutFileUseCase = (key: string, content: FileContent) => Promise<void>;

export function createPutFileUseCase({
  fileStorage,
}: { fileStorage: FileStorage }): PutFileUseCase {
  return async (key, content) => {
    try {
      await fileStorage.put(key, content);
    } catch (error) {
      throw mapFileStorageError(error);
    }
  };
}
