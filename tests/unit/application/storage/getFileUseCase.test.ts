import { describe, expect, it } from "vitest";
import { createGetFileUseCase } from "../../../../src/application/storage/getFileUseCase.js";
import { FileNotFoundError } from "../../../../src/application/storageErrors.js";
import { InMemoryFileStorage } from "../../../../src/data/storage/inMemoryFileStorage.js";

describe("createGetFileUseCase", () => {
  it("returns stored content", async () => {
    const fileStorage = new InMemoryFileStorage();
    const getFile = createGetFileUseCase({ fileStorage });
    const content = new Uint8Array([1, 2, 3]);
    await fileStorage.put("files/example.bin", content);

    await expect(getFile("files/example.bin")).resolves.toEqual(content);
  });

  it("throws FileNotFoundError for a missing file", async () => {
    const getFile = createGetFileUseCase({ fileStorage: new InMemoryFileStorage() });

    await expect(getFile("missing.bin")).rejects.toBeInstanceOf(FileNotFoundError);
  });
});
