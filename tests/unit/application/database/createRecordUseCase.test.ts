import { describe, expect, it } from "vitest";
import { createCreateRecordUseCase } from "../../../../src/application/database/createRecordUseCase.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createCreateRecordUseCase", () => {
  it("creates a record", async () => {
    const createRecord = createCreateRecordUseCase({
      recordStore: new InMemoryRecordStore(),
    });

    await expect(createRecord("items", { name: "item" })).resolves.toEqual({
      id: "1",
      data: { name: "item" },
    });
  });
});
