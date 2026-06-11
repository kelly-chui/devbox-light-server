import { RecordNotFoundError } from "./errors.js";
import type { RecordStore } from "./recordStore.js";
import type { RecordData, StoredRecord } from "./types.js";

export class DatabaseService {
  private readonly recordStore: RecordStore;

  constructor(recordStore: RecordStore) {
    this.recordStore = recordStore;
  }

  async listRecords(collection: string): Promise<StoredRecord[]> {
    return this.recordStore.list(collection);
  }

  async getRecord(collection: string, id: string): Promise<StoredRecord> {
    const record = await this.recordStore.get(collection, id);
    if (record === undefined) {
      throw new RecordNotFoundError(collection, id);
    }
    return record;
  }

  async createRecord(
    collection: string,
    data: RecordData,
  ): Promise<StoredRecord> {
    return this.recordStore.create(collection, data);
  }

  async replaceRecord(
    collection: string,
    id: string,
    data: RecordData,
  ): Promise<StoredRecord> {
    await this.recordStore.replace(collection, id, data);
    return this.getRecord(collection, id);
  }

  async deleteRecord(collection: string, id: string): Promise<void> {
    const deleted = await this.recordStore.delete(collection, id);
    if (!deleted) {
      throw new RecordNotFoundError(collection, id);
    }
  }
}
