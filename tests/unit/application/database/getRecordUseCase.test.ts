import { describe, expect, it } from "vitest";
import { createGetRecordUseCase } from "../../../../src/application/database/getRecordUseCase.js";
import { DatabaseRecordNotFoundError } from "../../../../src/application/databaseErrors.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createGetRecordUseCase", () => {
  it("returns an existing record", async () => {
    const recordStore = new InMemoryRecordStore();
    const getRecord = createGetRecordUseCase({ recordStore });
    const record = await recordStore.create("items", { name: "item" });

    await expect(getRecord("items", record.id)).resolves.toEqual(record);
  });

  it("throws the application not-found error", async () => {
    const getRecord = createGetRecordUseCase({ recordStore: new InMemoryRecordStore() });

    await expect(getRecord("items", "missing-id")).rejects.toBeInstanceOf(
      DatabaseRecordNotFoundError,
    );
  });
});
