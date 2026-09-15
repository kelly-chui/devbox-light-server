import type { RecordStore } from "../../domain/db/recordStore.js";
import { DatabaseRecordNotFoundError } from "../databaseErrors.js";
import { mapRecordStoreError } from "./mapRecordStoreError.js";

export type DeleteRecordUseCase = (
  collection: string,
  id: string,
) => Promise<void>;

export function createDeleteRecordUseCase({
  recordStore,
}: { recordStore: RecordStore }): DeleteRecordUseCase {
  return async (collection, id) => {
    let deleted: boolean;
    try {
      deleted = await recordStore.delete(collection, id);
    } catch (error) {
      throw mapRecordStoreError(error);
    }
    if (!deleted) {
      throw new DatabaseRecordNotFoundError(collection, id);
    }
  };
}
