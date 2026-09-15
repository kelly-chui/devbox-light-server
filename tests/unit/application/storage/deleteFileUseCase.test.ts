import { describe, expect, it } from "vitest";
import { createDeleteFileUseCase } from "../../../../src/application/storage/deleteFileUseCase.js";
import { FileNotFoundError } from "../../../../src/application/storageErrors.js";
import { InMemoryFileStorage } from "../../../../src/data/storage/inMemoryFileStorage.js";

describe("createDeleteFileUseCase", () => {
  it("deletes a stored file", async () => {
    const fileStorage = new InMemoryFileStorage();
    const deleteFile = createDeleteFileUseCase({ fileStorage });
    await fileStorage.put("files/example.bin", new Uint8Array([1, 2, 3]));

    await expect(deleteFile("files/example.bin")).resolves.toBeUndefined();
  });

  it("throws FileNotFoundError for a missing file", async () => {
    const deleteFile = createDeleteFileUseCase({ fileStorage: new InMemoryFileStorage() });

    await expect(deleteFile("missing.bin")).rejects.toBeInstanceOf(FileNotFoundError);
  });
});
