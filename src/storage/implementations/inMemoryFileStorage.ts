import type { FileStorage } from "../fileStorage.js";
import type { FileContent } from "../types.js";

export class InMemoryFileStorage implements FileStorage {
  private readonly files = new Map<string, FileContent>();

  async get(key: string): Promise<FileContent | undefined> {
    const content = this.files.get(key);
    if (content === undefined) {
      return undefined;
    }
    return new Uint8Array(content);
  }

  async put(key: string, content: FileContent): Promise<void> {
    this.files.set(key, new Uint8Array(content));
  }

  async delete(key: string): Promise<boolean> {
    return this.files.delete(key);
  }
}
