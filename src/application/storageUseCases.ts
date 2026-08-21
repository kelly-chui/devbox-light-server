import { FileNotFoundError } from "../domain/storage/errors.js";
import type { FileStorage } from "../domain/storage/fileStorage.js";
import type { FileContent } from "../domain/storage/types.js";

export class StorageUseCases {
  private readonly fileStorage: FileStorage;

  constructor(fileStorage: FileStorage) {
    this.fileStorage = fileStorage;
  }

  async getFile(key: string): Promise<FileContent> {
    const content = await this.fileStorage.get(key);
    if (content === undefined) {
      throw new FileNotFoundError(key);
    }
    return content;
  }

  async putFile(key: string, content: FileContent): Promise<void> {
    await this.fileStorage.put(key, content);
  }

  async deleteFile(key: string): Promise<void> {
    const deleted = await this.fileStorage.delete(key);
    if (!deleted) {
      throw new FileNotFoundError(key);
    }
  }
}
