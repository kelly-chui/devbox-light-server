import {
  InvalidCollectionNameError,
  RecordNotFoundError,
  RecordStoreReadError,
  RecordStoreWriteError,
} from "../../domain/db/recordStore.js";
import {
  DatabaseInvalidCollectionError,
  DatabaseReadError,
  DatabaseRecordNotFoundError,
  DatabaseWriteError,
} from "../databaseErrors.js";

export function mapRecordStoreError(error: unknown): Error {
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
  return error instanceof Error ? error : new Error("Unknown record store error.");
}
