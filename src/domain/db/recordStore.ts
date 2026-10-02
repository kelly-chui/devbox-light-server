import type {
  ListRecordsOptions,
  ListRecordsResult,
  RecordData,
  StoredRecord,
} from "./types.js";

export interface RecordStore {
  list(
    collection: string,
    options?: ListRecordsOptions,
  ): Promise<ListRecordsResult>;
  get(collection: string, id: string): Promise<StoredRecord | undefined>;
  create(collection: string, data: RecordData): Promise<StoredRecord>;
  replace(collection: string, id: string, data: RecordData): Promise<void>;
  update(collection: string, id: string, data: RecordData): Promise<StoredRecord>;
  delete(collection: string, id: string): Promise<boolean>;
}

export class RecordNotFoundError extends Error {
  readonly name = "RecordNotFoundError";

  constructor(readonly collection: string, readonly id: string) {
    super(`Record not found: ${collection}/${id}`);
  }
}

export class InvalidCollectionNameError extends Error {
  readonly name = "InvalidCollectionNameError";
  constructor(readonly collection: string) {
    super(`Invalid collection name: ${collection}`);
  }
}

export class RecordStoreReadError extends Error {
  readonly name = "RecordStoreReadError";
  constructor(options?: { cause?: unknown }) {
    super("Record store read failed.", options);
  }
}

export class RecordStoreWriteError extends Error {
  readonly name = "RecordStoreWriteError";
  constructor(options?: { cause?: unknown }) {
    super("Record store write failed.", options);
  }
}
