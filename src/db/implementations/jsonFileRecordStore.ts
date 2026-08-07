import path from "node:path";
import { readJsonFile, writeJsonFile } from "../../util/jsonFile.js";
import {
  InvalidCollectionNameError,
  InvalidDatabaseFileError,
  RecordNotFoundError,
} from "../errors.js";
import type { RecordStore } from "../recordStore.js";
import type { RecordData, StoredRecord } from "../types.js";

const COLLECTION_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

type PersistedCollection = {
  nextId: number;
  records: Record<string, RecordData>;
};

type CollectionStore = {
  nextId: number;
  records: Map<string, RecordData>;
};

function isPersistedCollection(value: unknown): value is PersistedCollection {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as PersistedCollection;
  return (
    typeof candidate.nextId === "number" &&
    typeof candidate.records === "object" &&
    candidate.records !== null &&
    !Array.isArray(candidate.records)
  );
}

export class JsonFileRecordStore implements RecordStore {
  private readonly rootDirectory: string;
  private readonly collections = new Map<string, CollectionStore>();

  constructor(rootDirectory: string) {
    this.rootDirectory = path.resolve(rootDirectory);
  }

  private collectionFilePath(collection: string): string {
    return path.join(this.rootDirectory, `${collection}.json`);
  }

  private validateCollection(collection: string): void {
    if (!COLLECTION_NAME_PATTERN.test(collection)) {
      throw new InvalidCollectionNameError(collection);
    }
  }

  private async loadCollection(collection: string): Promise<CollectionStore> {
    this.validateCollection(collection);
    const existing = this.collections.get(collection);
    if (existing !== undefined) {
      return existing;
    }

    const filePath = this.collectionFilePath(collection);
    const persisted = await readJsonFile(filePath);
    const store: CollectionStore = { nextId: 1, records: new Map() };

    if (persisted !== undefined) {
      if (!isPersistedCollection(persisted)) {
        throw new InvalidDatabaseFileError(filePath);
      }
      store.nextId = persisted.nextId;
      for (const [id, data] of Object.entries(persisted.records)) {
        store.records.set(id, data);
      }
    }

    this.collections.set(collection, store);
    return store;
  }

  private async persist(
    collection: string,
    store: CollectionStore,
  ): Promise<void> {
    const records = Object.fromEntries(store.records);
    const value: PersistedCollection = { nextId: store.nextId, records };
    await writeJsonFile(this.collectionFilePath(collection), value);
  }

  async list(collection: string): Promise<StoredRecord[]> {
    const store = await this.loadCollection(collection);
    return Array.from(store.records.entries()).map(([id, data]) => ({
      id,
      data: structuredClone(data),
    }));
  }

  async get(collection: string, id: string): Promise<StoredRecord | undefined> {
    const store = await this.loadCollection(collection);
    const data = store.records.get(id);
    if (data === undefined) {
      return undefined;
    }
    return { id, data: structuredClone(data) };
  }

  async create(collection: string, data: RecordData): Promise<StoredRecord> {
    const store = await this.loadCollection(collection);
    const id = String(store.nextId);
    store.nextId += 1;
    store.records.set(id, structuredClone(data));
    await this.persist(collection, store);
    return { id, data: structuredClone(data) };
  }

  async replace(
    collection: string,
    id: string,
    data: RecordData,
  ): Promise<void> {
    const store = await this.loadCollection(collection);
    if (!store.records.has(id)) {
      throw new RecordNotFoundError(collection, id);
    }
    store.records.set(id, structuredClone(data));
    await this.persist(collection, store);
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const store = await this.loadCollection(collection);
    const deleted = store.records.delete(id);
    if (deleted) {
      await this.persist(collection, store);
    }
    return deleted;
  }
}
