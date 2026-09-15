import type { RecordStore } from "../../domain/db/recordStore.js";
import type { RecordData, StoredRecord } from "../../domain/db/types.js";
import { DatabaseRecordNotFoundError } from "../databaseErrors.js";
import { mapRecordStoreError } from "./mapRecordStoreError.js";

export type ReplaceRecordUseCase = (
  collection: string,
  id: string,
  data: RecordData,
) => Promise<StoredRecord>;

export function createReplaceRecordUseCase({
  recordStore,
}: { recordStore: RecordStore }): ReplaceRecordUseCase {
  return async (collection, id, data) => {
    try {
      await recordStore.replace(collection, id, data);
    } catch (error) {
      throw mapRecordStoreError(error);
    }

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
