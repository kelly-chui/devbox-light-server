import path from "node:path";
import type { RecordStore } from "../domain/db/recordStore.js";
import { InMemoryRecordStore } from "../data/db/inMemoryRecordStore.js";
import { JsonFileRecordStore } from "../data/db/jsonFileRecordStore.js";
import type { TokenStore } from "../domain/auth/tokenStore.js";
import { InMemoryTokenStore } from "../data/auth/inMemoryTokenStore.js";
import { JsonFileTokenStore } from "../data/auth/jsonFileTokenStore.js";
import type { FileStorage } from "../domain/storage/fileStorage.js";
import { InMemoryFileStorage } from "../data/storage/inMemoryFileStorage.js";
import { LocalFileStorage } from "../data/storage/localFileStorage.js";

export type PersistenceMode = "json" | "memory";

export type RuntimeStores = {
  recordStore: RecordStore;
  tokenStore: TokenStore;
  fileStorage: FileStorage;
};

export function createRuntimeStores(
  mode: PersistenceMode,
  dataDirectory: string,
): RuntimeStores {
  switch (mode) {
    case "memory":
      return {
        recordStore: new InMemoryRecordStore(),
        tokenStore: new InMemoryTokenStore(),
        fileStorage: new InMemoryFileStorage(),
      };
    case "json":
      return {
        recordStore: new JsonFileRecordStore(dataDirectory),
        tokenStore: new JsonFileTokenStore(dataDirectory),
        fileStorage: new LocalFileStorage(path.join(dataDirectory, "files")),
      };
  }
}

export function readPersistenceMode(
  value: string | undefined,
): PersistenceMode {
  if (value === undefined || value === "") {
    return "json";
  }
  if (value === "json" || value === "memory") {
    return value;
  }
  throw new Error(
    `Unknown PERSISTENCE mode: "${value}" (expected "json" or "memory")`,
  );
}
