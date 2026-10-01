import type { RecordStore } from "../../domain/db/recordStore.js";
import type {
  ListRecordsOptions,
  ListRecordsResult,
} from "../../domain/db/types.js";
import { mapRecordStoreError } from "./mapRecordStoreError.js";

export type ListRecordsUseCase = (
  collection: string,
  options?: ListRecordsOptions,
) => Promise<ListRecordsResult>;

export function createListRecordsUseCase({
  recordStore,
}: { recordStore: RecordStore }): ListRecordsUseCase {
  return async (collection, options) => {
    try {
      return await recordStore.list(collection, options);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
  };
}
