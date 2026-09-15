import { describe, expect, it } from "vitest";
import { createListRecordsUseCase } from "../../../../src/application/database/listRecordsUseCase.js";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";

describe("createListRecordsUseCase", () => {
  it("lists records in a collection", async () => {
    const recordStore = new InMemoryRecordStore();
    const listRecords = createListRecordsUseCase({ recordStore });
    const first = await recordStore.create("items", { name: "first" });
    const second = await recordStore.create("items", { name: "second" });

    await expect(listRecords("items")).resolves.toEqual([first, second]);
  });
});
