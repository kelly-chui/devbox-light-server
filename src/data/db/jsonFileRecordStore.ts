import { randomUUID } from "node:crypto";
import path from "node:path";
import {
  readJsonFile,
  runJsonFileOperation,
  writeJsonFile,
} from "../persistence/jsonFile.js";
import {
  InvalidCollectionNameError,
  RecordNotFoundError,
  RecordStoreReadError,
  RecordStoreWriteError,
  type RecordStore,
} from "../../domain/db/recordStore.js";
import type {
  ListRecordsOptions,
  ListRecordsResult,
  RecordData,
  StoredRecord,
} from "../../domain/db/types.js";
import { applyListRecordsOptions } from "./listRecords.js";

const COLLECTION_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

type PersistedCollection = {
  records: Record<string, RecordData>;
};

function isPersistedCollection(value: unknown): value is PersistedCollection {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as PersistedCollection;
  return (
    typeof candidate.records === "object" &&
    candidate.records !== null &&
    !Array.isArray(candidate.records)
  );
}

export class JsonFileRecordStore implements RecordStore {
  private readonly rootDirectory: string;

  constructor(rootDirectory: string) {
    this.rootDirectory = path.resolve(rootDirectory);
  }

  private collectionFilePath(collection: string): string {
    this.validateCollection(collection);
    return path.join(this.rootDirectory, `${collection}.json`);
  }

  private validateCollection(collection: string): void {
    if (!COLLECTION_NAME_PATTERN.test(collection)) {
      throw new InvalidCollectionNameError(collection);
    }
  }

  private async readCollection(collection: string): Promise<PersistedCollection> {
    const filePath = this.collectionFilePath(collection);
    let persisted: unknown | undefined;
    try {
      persisted = await readJsonFile(filePath);
    } catch (error) {
      throw new RecordStoreReadError({ cause: error });
    }
    if (persisted !== undefined) {
      if (!isPersistedCollection(persisted)) {
        throw new RecordStoreReadError({
          cause: new Error(`Invalid database file: ${filePath}`),
        });
      }
      return persisted;
    }
    return { records: {} };
  }

  private async writeCollection(
    collection: string,
    value: PersistedCollection,
  ): Promise<void> {
    try {
      await writeJsonFile(this.collectionFilePath(collection), value);
    } catch (error) {
      throw new RecordStoreWriteError({ cause: error });
    }
  }

  async list(
    collection: string,
    options?: ListRecordsOptions,
  ): Promise<ListRecordsResult> {
    const store = await this.readCollection(collection);
    const records = Object.entries(store.records).map(([id, data]) => ({
      id,
      data: structuredClone(data),
    }));
    return applyListRecordsOptions(records, options);
  }

  async get(collection: string, id: string): Promise<StoredRecord | undefined> {
    const store = await this.readCollection(collection);
    const data = store.records[id];
    if (data === undefined) {
      return undefined;
    }
    return { id, data: structuredClone(data) };
  }

  async create(collection: string, data: RecordData): Promise<StoredRecord> {
    const filePath = this.collectionFilePath(collection);
    return runJsonFileOperation(filePath, async () => {
      const store = await this.readCollection(collection);
      const id = randomUUID();
      const next = {
        records: { ...store.records, [id]: structuredClone(data) },
      };
      await this.writeCollection(collection, next);
      return { id, data: structuredClone(data) };
    });
  }

  async replace(
    collection: string,
    id: string,
    data: RecordData,
  ): Promise<void> {
    const filePath = this.collectionFilePath(collection);
    await runJsonFileOperation(filePath, async () => {
      const store = await this.readCollection(collection);
      if (!(id in store.records)) {
        throw new RecordNotFoundError(collection, id);
      }
      await this.writeCollection(collection, {
        records: { ...store.records, [id]: structuredClone(data) },
      });
    });
  }

  async update(collection: string, id: string, data: RecordData): Promise<StoredRecord> {
    const filePath = this.collectionFilePath(collection);
    return runJsonFileOperation(filePath, async () => {
      const store = await this.readCollection(collection);
      if (!(id in store.records)) {
        throw new RecordNotFoundError(collection, id);
      }
      const updated = structuredClone({ ...store.records[id], ...data });
      await this.writeCollection(collection, {
        records: { ...store.records, [id]: updated },
      });
      return { id, data: structuredClone(updated) };
    });
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const filePath = this.collectionFilePath(collection);
    return runJsonFileOperation(filePath, async () => {
      const store = await this.readCollection(collection);
      const deleted = id in store.records;
      if (deleted) {
        const records = { ...store.records };
        delete records[id];
        await this.writeCollection(collection, {
          records,
        });
      }
      return deleted;
    });
  }
}
