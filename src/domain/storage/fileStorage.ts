import type { FileContent } from "./types.js";

export interface FileStorage {
  get(key: string): Promise<FileContent | undefined>;
  put(key: string, content: FileContent): Promise<void>;
  delete(key: string): Promise<boolean>;
}
