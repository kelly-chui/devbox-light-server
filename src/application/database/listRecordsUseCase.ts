import type { RecordStore } from "../../domain/db/recordStore.js";
import type { StoredRecord } from "../../domain/db/types.js";
import { mapRecordStoreError } from "./mapRecordStoreError.js";

export type ListRecordsUseCase = (collection: string) => Promise<StoredRecord[]>;

export function createListRecordsUseCase({
  recordStore,
}: { recordStore: RecordStore }): ListRecordsUseCase {
  return async (collection) => {
    try {
      return await recordStore.list(collection);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
  };
}
