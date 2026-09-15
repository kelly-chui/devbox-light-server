import { describe, expect, it } from "vitest";
import { createReplaceRecordUseCase } from "../../../../src/application/database/replaceRecordUseCase.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createReplaceRecordUseCase", () => {
  it("replaces and returns a record", async () => {
    const recordStore = new InMemoryRecordStore();
    const replaceRecord = createReplaceRecordUseCase({ recordStore });
    const record = await recordStore.create("items", { name: "before" });

    await expect(replaceRecord("items", record.id, { name: "after" })).resolves.toEqual({
      id: record.id,
      data: { name: "after" },
    });
  });
});
