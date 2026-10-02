import { describe, expect, it } from "vitest";
import { createUpdateRecordUseCase } from "../../../../src/application/database/updateRecordUseCase.js";
import { DatabaseRecordNotFoundError } from "../../../../src/application/databaseErrors.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createUpdateRecordUseCase", () => {
  it("updates and returns the merged record", async () => {
    const recordStore = new InMemoryRecordStore();
    const updateRecord = createUpdateRecordUseCase({ recordStore });
    const record = await recordStore.create("items", { name: "before", retained: true });

    await expect(updateRecord("items", record.id, { name: "after", added: null })).resolves.toEqual({
      id: record.id,
      data: { name: "after", retained: true, added: null },
    });
  });

  it("maps a missing record to the application error", async () => {
    const updateRecord = createUpdateRecordUseCase({ recordStore: new InMemoryRecordStore() });
    await expect(updateRecord("items", "missing", {})).rejects.toBeInstanceOf(DatabaseRecordNotFoundError);
  });
});
