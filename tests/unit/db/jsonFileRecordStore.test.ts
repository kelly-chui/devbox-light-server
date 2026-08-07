import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  InvalidCollectionNameError,
  InvalidDatabaseFileError,
  RecordNotFoundError,
} from "../../../src/db/errors.js";
import { JsonFileRecordStore } from "../../../src/db/implementations/jsonFileRecordStore.js";
import { JsonFileReadError } from "../../../src/util/jsonFile.js";

describe("JsonFileRecordStore", () => {
  let rootDirectory: string;
  let store: JsonFileRecordStore;

  beforeEach(async () => {
    rootDirectory = await mkdtemp(path.join(tmpdir(), "json-db-"));
    store = new JsonFileRecordStore(rootDirectory);
  });

  afterEach(async () => {
    await rm(rootDirectory, { recursive: true, force: true });
  });

  async function createUser(name = "Ada") {
    return store.create("users", { name });
  }

  it("creates and gets records", async () => {
    const created = await createUser();

    expect(created.id).toBeDefined();
    expect(created.data).toEqual({ name: "Ada" });

    const fetched = await store.get("users", created.id);

    expect(fetched).toEqual(created);
  });

  it("lists records in insertion order per collection", async () => {
    await createUser("Ada");
    await createUser("Linus");

    const records = await store.list("users");

    expect(records).toHaveLength(2);
    expect(records[0]?.data).toEqual({ name: "Ada" });
    expect(records[1]?.data).toEqual({ name: "Linus" });
  });

  it("returns an empty list for a missing collection", async () => {
    expect(await store.list("missing")).toEqual([]);
    expect(await store.get("missing", "1")).toBeUndefined();
  });

  it("persists records to disk across instances", async () => {
    const created = await createUser();

    const reloaded = new JsonFileRecordStore(rootDirectory);

    expect(await reloaded.get("users", created.id)).toEqual(created);
  });

  it("continues the id sequence across instances", async () => {
    await createUser("Ada");
    await createUser("Linus");

    const reloaded = new JsonFileRecordStore(rootDirectory);
    const third = await reloaded.create("users", { name: "Grace" });

    expect(third.id).toBe("3");
    expect(await reloaded.list("users")).toHaveLength(3);
  });

  it("replaces existing records", async () => {
    const created = await createUser();

    await store.replace("users", created.id, { name: "Grace" });

    expect(await store.get("users", created.id)).toEqual({
      id: created.id,
      data: { name: "Grace" },
    });
  });

  it("persists replacements across instances", async () => {
    const created = await createUser();
    await store.replace("users", created.id, { name: "Grace" });

    const reloaded = new JsonFileRecordStore(rootDirectory);

    expect(await reloaded.get("users", created.id)).toEqual({
      id: created.id,
      data: { name: "Grace" },
    });
  });

  it("throws when replacing a missing record", async () => {
    await expect(
      store.replace("users", "999", { nope: true }),
    ).rejects.toBeInstanceOf(RecordNotFoundError);
  });

  it("deletes records", async () => {
    const created = await createUser();

    expect(await store.delete("users", created.id)).toBe(true);
    expect(await store.get("users", created.id)).toBeUndefined();
  });

  it("persists deletions across instances", async () => {
    const created = await createUser();
    await store.delete("users", created.id);

    const reloaded = new JsonFileRecordStore(rootDirectory);

    expect(await reloaded.get("users", created.id)).toBeUndefined();
  });

  it("returns false when deleting a missing record", async () => {
    expect(await store.delete("users", "999")).toBe(false);
    expect(await store.delete("missing", "1")).toBe(false);
  });

  it("preserves the id sequence after deleting records", async () => {
    const created = await createUser();
    await store.delete("users", created.id);
    await store.create("users", { name: "Ada" });

    const reloaded = new JsonFileRecordStore(rootDirectory);
    const next = await reloaded.create("users", { name: "Linus" });

    expect(next.id).toBe("3");
  });

  it("does not leak stored data references", async () => {
    const payload = {
      profile: {
        name: "Ada",
      },
    };

    const created = await store.create("users", payload);

    payload.profile.name = "MUTATED";
    created.data.profile = { name: "MUTATED2" };

    expect(await store.get("users", created.id)).toEqual({
      id: created.id,
      data: {
        profile: {
          name: "Ada",
        },
      },
    });
  });

  it("isolates collections", async () => {
    await store.create("users", { name: "Ada" });
    await store.create("posts", { title: "Hello" });

    expect(await store.list("users")).toEqual([
      { id: expect.any(String), data: { name: "Ada" } },
    ]);
    expect(await store.list("posts")).toEqual([
      { id: expect.any(String), data: { title: "Hello" } },
    ]);
  });

  it("throws on invalid collection names", async () => {
    await expect(store.list("../secret")).rejects.toBeInstanceOf(
      InvalidCollectionNameError,
    );
    await expect(store.get("a/b", "1")).rejects.toBeInstanceOf(
      InvalidCollectionNameError,
    );
    await expect(store.create("", {})).rejects.toBeInstanceOf(
      InvalidCollectionNameError,
    );
  });

  it("throws a clear error on a corrupted file", async () => {
    await store.create("users", { name: "Ada" });
    await writeFile(
      path.join(rootDirectory, "users.json"),
      "{ not valid json",
    );

    const reloaded = new JsonFileRecordStore(rootDirectory);

    await expect(reloaded.list("users")).rejects.toBeInstanceOf(
      JsonFileReadError,
    );
  });

  it("throws a clear error on a malformed database file", async () => {
    await writeFile(
      path.join(rootDirectory, "users.json"),
      JSON.stringify({ notADatabase: true }),
    );

    const reloaded = new JsonFileRecordStore(rootDirectory);

    await expect(reloaded.list("users")).rejects.toBeInstanceOf(
      InvalidDatabaseFileError,
    );
  });

  it("writes valid JSON that round-trips", async () => {
    await createUser("Ada");

    const content = await readFile(
      path.join(rootDirectory, "users.json"),
      "utf8",
    );

    expect(JSON.parse(content)).toEqual({
      nextId: 2,
      records: {
        "1": { name: "Ada" },
      },
    });
  });
});
