import type { RecordStore } from "../../domain/db/recordStore.js";
import type { StoredRecord } from "../../domain/db/types.js";
import { DatabaseRecordNotFoundError } from "../databaseErrors.js";
import { mapRecordStoreError } from "./mapRecordStoreError.js";

export type GetRecordUseCase = (
  collection: string,
  id: string,
) => Promise<StoredRecord>;

export function createGetRecordUseCase({
  recordStore,
}: { recordStore: RecordStore }): GetRecordUseCase {
  return async (collection, id) => {
    let record: StoredRecord | undefined;
    try {
      record = await recordStore.get(collection, id);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
    if (record === undefined) {
      throw new DatabaseRecordNotFoundError(collection, id);
    }
    return record;
  };
}
