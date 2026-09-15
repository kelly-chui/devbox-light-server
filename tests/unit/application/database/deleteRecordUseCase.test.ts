import { describe, expect, it } from "vitest";
import { createDeleteRecordUseCase } from "../../../../src/application/database/deleteRecordUseCase.js";
import { DatabaseRecordNotFoundError } from "../../../../src/application/databaseErrors.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createDeleteRecordUseCase", () => {
  it("deletes an existing record", async () => {
    const recordStore = new InMemoryRecordStore();
    const deleteRecord = createDeleteRecordUseCase({ recordStore });
    const record = await recordStore.create("items", { name: "item" });

    await expect(deleteRecord("items", record.id)).resolves.toBeUndefined();
  });

  it("throws the application not-found error", async () => {
    const deleteRecord = createDeleteRecordUseCase({ recordStore: new InMemoryRecordStore() });

    await expect(deleteRecord("items", "missing-id")).rejects.toBeInstanceOf(
      DatabaseRecordNotFoundError,
    );
  });
});
