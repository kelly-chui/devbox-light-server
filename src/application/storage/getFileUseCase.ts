import type { FileStorage } from "../../domain/storage/fileStorage.js";
import type { FileContent } from "../../domain/storage/types.js";
import { FileNotFoundError } from "../storageErrors.js";
import { mapFileStorageError } from "./mapFileStorageError.js";

export type GetFileUseCase = (key: string) => Promise<FileContent>;

export function createGetFileUseCase({
  fileStorage,
}: { fileStorage: FileStorage }): GetFileUseCase {
  return async (key) => {
    let content: FileContent | undefined;
    try {
      content = await fileStorage.get(key);
    } catch (error) {
      throw mapFileStorageError(error);
    }
    if (content === undefined) {
      throw new FileNotFoundError(key);
    }
    return content;
  };
}
