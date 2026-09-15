import type { RecordStore } from "../../domain/db/recordStore.js";
import type { RecordData, StoredRecord } from "../../domain/db/types.js";
import { mapRecordStoreError } from "./mapRecordStoreError.js";

export type CreateRecordUseCase = (
  collection: string,
  data: RecordData,
) => Promise<StoredRecord>;

export function createCreateRecordUseCase({
  recordStore,
}: { recordStore: RecordStore }): CreateRecordUseCase {
  return async (collection, data) => {
    try {
      return await recordStore.create(collection, data);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
  };
}
