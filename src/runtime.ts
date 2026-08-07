import path from "node:path";
import type { RecordStore } from "./db/recordStore.js";
import { InMemoryRecordStore } from "./db/implementations/inMemoryRecordStore.js";
import { JsonFileRecordStore } from "./db/implementations/jsonFileRecordStore.js";
import type { TokenStore } from "./auth/tokenStore.js";
import { InMemoryTokenStore } from "./auth/implementations/inMemoryTokenStore.js";
import { JsonFileTokenStore } from "./auth/implementations/jsonFileTokenStore.js";
import type { FileStorage } from "./storage/fileStorage.js";
import { InMemoryFileStorage } from "./storage/implementations/inMemoryFileStorage.js";
import { LocalFileStorage } from "./storage/implementations/localFileStorage.js";

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
