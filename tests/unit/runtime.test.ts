import { describe, expect, it } from "vitest";
import { JsonFileRecordStore } from "../../src/data/db/jsonFileRecordStore.js";
import { InMemoryRecordStore } from "../../src/data/db/inMemoryRecordStore.js";
import { JsonFileTokenStore } from "../../src/data/auth/jsonFileTokenStore.js";
import { InMemoryTokenStore } from "../../src/data/auth/inMemoryTokenStore.js";
import { LocalFileStorage } from "../../src/data/storage/localFileStorage.js";
import { InMemoryFileStorage } from "../../src/data/storage/inMemoryFileStorage.js";
import {
  createRuntimeStores,
  readPersistenceMode,
} from "../../src/config/runtime.js";

describe("readPersistenceMode", () => {
  it("defaults to json when unset or empty", () => {
    expect(readPersistenceMode(undefined)).toBe("json");
    expect(readPersistenceMode("")).toBe("json");
  });

  it("accepts json and memory", () => {
    expect(readPersistenceMode("json")).toBe("json");
    expect(readPersistenceMode("memory")).toBe("memory");
  });

  it("throws on unknown values", () => {
    expect(() => readPersistenceMode("foo")).toThrow(
      'Unknown PERSISTENCE mode: "foo"',
    );
  });
});

describe("createRuntimeStores", () => {
  it("returns in-memory implementations in memory mode", () => {
    const stores = createRuntimeStores("memory", ".data");

    expect(stores.recordStore).toBeInstanceOf(InMemoryRecordStore);
    expect(stores.tokenStore).toBeInstanceOf(InMemoryTokenStore);
    expect(stores.fileStorage).toBeInstanceOf(InMemoryFileStorage);
  });

  it("returns file-backed implementations in json mode", () => {
    const stores = createRuntimeStores("json", ".data");

    expect(stores.recordStore).toBeInstanceOf(JsonFileRecordStore);
    expect(stores.tokenStore).toBeInstanceOf(JsonFileTokenStore);
    expect(stores.fileStorage).toBeInstanceOf(LocalFileStorage);
  });
});
