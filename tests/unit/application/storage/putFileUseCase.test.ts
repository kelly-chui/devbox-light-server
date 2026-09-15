import { describe, expect, it } from "vitest";
import { createPutFileUseCase } from "../../../../src/application/storage/putFileUseCase.js";
import { InMemoryFileStorage } from "../../../../src/data/storage/inMemoryFileStorage.js";

describe("createPutFileUseCase", () => {
  it("stores content at the requested key", async () => {
    const fileStorage = new InMemoryFileStorage();
    const putFile = createPutFileUseCase({ fileStorage });
    const content = new Uint8Array([1, 2, 3]);

    await putFile("files/example.bin", content);

    await expect(fileStorage.get("files/example.bin")).resolves.toEqual(content);
  });
});
