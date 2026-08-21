import {
  InvalidCollectionNameError,
  RecordNotFoundError,
  RecordStoreReadError,
  RecordStoreWriteError,
  type RecordStore,
} from "../domain/db/recordStore.js";
import {
  DatabaseInvalidCollectionError,
  DatabaseReadError,
  DatabaseRecordNotFoundError,
  DatabaseWriteError,
} from "./databaseErrors.js";
import type { RecordData, StoredRecord } from "../domain/db/types.js";

export class DatabaseUseCases {
  private readonly recordStore: RecordStore;

  constructor(recordStore: RecordStore) {
    this.recordStore = recordStore;
  }

  async listRecords(collection: string): Promise<StoredRecord[]> {
    try { return await this.recordStore.list(collection); }
    catch (error) { throw this.mapError(error); }
  }

  async getRecord(collection: string, id: string): Promise<StoredRecord> {
    let record: StoredRecord | undefined;
    try { record = await this.recordStore.get(collection, id); }
    catch (error) { throw this.mapError(error); }
    if (record === undefined) {
      throw new DatabaseRecordNotFoundError(collection, id);
    }
    return record;
  }

  async createRecord(
    collection: string,
    data: RecordData,
  ): Promise<StoredRecord> {
    try { return await this.recordStore.create(collection, data); }
    catch (error) { throw this.mapError(error); }
  }

  async replaceRecord(
    collection: string,
    id: string,
    data: RecordData,
  ): Promise<StoredRecord> {
    try { await this.recordStore.replace(collection, id, data); }
    catch (error) { throw this.mapError(error); }
    return this.getRecord(collection, id);
  }

  async deleteRecord(collection: string, id: string): Promise<void> {
    let deleted: boolean;
    try { deleted = await this.recordStore.delete(collection, id); }
    catch (error) { throw this.mapError(error); }
    if (!deleted) {
      throw new DatabaseRecordNotFoundError(collection, id);
    }
  }

  private mapError(error: unknown): Error {
    if (error instanceof InvalidCollectionNameError) {
      return new DatabaseInvalidCollectionError(error.collection);
    }
    if (error instanceof RecordNotFoundError) {
      return new DatabaseRecordNotFoundError(error.collection, error.id);
    }
    if (error instanceof RecordStoreWriteError) {
      return new DatabaseWriteError({ cause: error });
    }
    if (error instanceof RecordStoreReadError) {
      return new DatabaseReadError({ cause: error });
    }
    throw error;
  }
}
