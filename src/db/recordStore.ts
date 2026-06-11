import type { RecordData, StoredRecord } from "./types.js";

export interface RecordStore {
  list(collection: string): Promise<StoredRecord[]>;
  get(collection: string, id: string): Promise<StoredRecord | undefined>;
  create(collection: string, data: RecordData): Promise<StoredRecord>;
  replace(collection: string, id: string, data: RecordData): Promise<void>;
  delete(collection: string, id: string): Promise<boolean>;
}
