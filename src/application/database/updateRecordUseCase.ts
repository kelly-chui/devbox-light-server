import type { RecordStore } from "../../domain/db/recordStore.js";
import type { RecordData, StoredRecord } from "../../domain/db/types.js";
import { mapRecordStoreError } from "./mapRecordStoreError.js";

export type UpdateRecordUseCase = (
  collection: string,
  id: string,
  data: RecordData,
) => Promise<StoredRecord>;

export function createUpdateRecordUseCase({
  recordStore,
}: { recordStore: RecordStore }): UpdateRecordUseCase {
  return async (collection, id, data) => {
    try {
      return await recordStore.update(collection, id, data);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
  };
}
