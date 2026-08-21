import { FileNotFoundError, PathTraversalError, StorageError } from "./storageErrors.js";
import {
  FileStorageReadError,
  FileStorageWriteError,
  PathTraversalError as ContractPathTraversalError,
  type FileStorage,
} from "../domain/storage/fileStorage.js";
import type { FileContent } from "../domain/storage/types.js";

export class StorageUseCases {
  private readonly fileStorage: FileStorage;

  constructor(fileStorage: FileStorage) {
    this.fileStorage = fileStorage;
  }

  async getFile(key: string): Promise<FileContent> {
    let content: FileContent | undefined;
    try { content = await this.fileStorage.get(key); }
    catch (error) { throw this.mapError(error); }
    if (content === undefined) {
      throw new FileNotFoundError(key);
    }
    return content;
  }

  async putFile(key: string, content: FileContent): Promise<void> {
    try { await this.fileStorage.put(key, content); }
    catch (error) { throw this.mapError(error); }
  }

  async deleteFile(key: string): Promise<void> {
    let deleted: boolean;
    try { deleted = await this.fileStorage.delete(key); }
    catch (error) { throw this.mapError(error); }
    if (!deleted) {
      throw new FileNotFoundError(key);
    }
  }

  private mapError(error: unknown): Error {
    if (error instanceof ContractPathTraversalError) {
      return new PathTraversalError(error.key);
    }
    if (error instanceof FileStorageReadError || error instanceof FileStorageWriteError) {
      return new StorageError({ cause: error });
    }
    throw error;
  }
}
