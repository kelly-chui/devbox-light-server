import {
  FileStorageReadError,
  FileStorageWriteError,
  PathTraversalError as ContractPathTraversalError,
} from "../../domain/storage/fileStorage.js";
import { PathTraversalError, StorageError } from "../storageErrors.js";

export function mapFileStorageError(error: unknown): Error {
  if (error instanceof ContractPathTraversalError) {
    return new PathTraversalError(error.key);
  }
  if (error instanceof FileStorageReadError || error instanceof FileStorageWriteError) {
    return new StorageError({ cause: error });
  }
  return error instanceof Error ? error : new Error("Unknown file storage error.");
}
