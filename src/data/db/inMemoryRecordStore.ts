import { RecordNotFoundError, type RecordStore } from "../../domain/db/recordStore.js";
import type {
  ListRecordsOptions,
  ListRecordsResult,
  RecordData,
  StoredRecord,
} from "../../domain/db/types.js";
import { applyListRecordsOptions } from "./listRecords.js";

type CollectionStore = {
  nextId: number;
  records: Map<string, RecordData>;
};

export class InMemoryRecordStore implements RecordStore {
  private readonly collections = new Map<string, CollectionStore>();

  private getOrCreateCollection(collection: string): CollectionStore {
    const existing = this.collections.get(collection);
    if (existing !== undefined) {
      return existing;
    }
    const created: CollectionStore = { nextId: 1, records: new Map() };
    this.collections.set(collection, created);
    return created;
  }

  async list(
    collection: string,
    options?: ListRecordsOptions,
  ): Promise<ListRecordsResult> {
    const store = this.collections.get(collection);
    if (store === undefined) {
      return { records: [], total: 0 };
    }
    const records = Array.from(store.records.entries()).map(([id, data]) => ({
      id,
      data: structuredClone(data),
    }));
    return applyListRecordsOptions(records, options);
  }

  async get(collection: string, id: string): Promise<StoredRecord | undefined> {
    const store = this.collections.get(collection);
    if (store === undefined) {
      return undefined;
    }
    const data = store.records.get(id);
    if (data === undefined) {
      return undefined;
    }
    return { id, data: structuredClone(data) };
  }

  async create(collection: string, data: RecordData): Promise<StoredRecord> {
    const store = this.getOrCreateCollection(collection);
    const id = String(store.nextId);
    store.nextId += 1;
    store.records.set(id, structuredClone(data));
    return { id, data: structuredClone(data) };
  }

  async replace(collection: string, id: string, data: RecordData): Promise<void> {
    const store = this.collections.get(collection);
    if (store === undefined || !store.records.has(id)) {
      throw new RecordNotFoundError(collection, id);
    }
    store.records.set(id, structuredClone(data));
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const store = this.collections.get(collection);
    if (store === undefined) {
      return false;
    }
    return store.records.delete(id);
  }
}
