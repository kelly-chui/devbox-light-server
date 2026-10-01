import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InvalidCollectionNameError, RecordStoreReadError } from "../../../../src/domain/db/recordStore.js";
import { RecordNotFoundError } from "../../../../src/domain/db/recordStore.js";
import { JsonFileRecordStore } from "../../../../src/data/db/jsonFileRecordStore.js";

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

    expect(records.records).toHaveLength(2);
    expect(records.records[0]?.data).toEqual({ name: "Ada" });
    expect(records.records[1]?.data).toEqual({ name: "Linus" });
    expect(records.total).toBe(2);
  });

  it("filters records by exact top-level fields with AND semantics", async () => {
    const open = await store.create("todos", {
      status: "open",
      completed: false,
      priority: 3,
    });
    await store.create("todos", {
      status: "done",
      completed: true,
      priority: 3,
    });
    await store.create("todos", {
      status: "open",
      completed: false,
      priority: 1,
    });

    await expect(
      store.list("todos", {
        filter: { status: "open", completed: false, priority: 3 },
      }),
    ).resolves.toEqual({ records: [open], total: 1 });
  });

  it("sorts top-level fields in both directions with id tie-breaking", async () => {
    const first = await store.create("todos", { priority: 2 });
    const second = await store.create("todos", { priority: 1 });
    const third = await store.create("todos", { priority: 2 });
    const tiedRecords = [first, third].sort((left, right) =>
      left.id.localeCompare(right.id),
    );

    await expect(
      store.list("todos", { sort: { field: "priority", direction: "asc" } }),
    ).resolves.toEqual({ records: [second, ...tiedRecords], total: 3 });
    await expect(
      store.list("todos", { sort: { field: "priority", direction: "desc" } }),
    ).resolves.toEqual({ records: [...tiedRecords, second], total: 3 });
    await expect(
      store.list("todos", { sort: { field: "id", direction: "desc" } }),
    ).resolves.toEqual({
      records: [first, second, third].sort((left, right) =>
        right.id.localeCompare(left.id),
      ),
      total: 3,
    });
  });

  it("filters before sorting and paginating while retaining the filtered total", async () => {
    await store.create("todos", { status: "done", priority: 1 });
    const second = await store.create("todos", { status: "open", priority: 2 });
    await store.create("todos", { status: "open", priority: 3 });
    await store.create("todos", { status: "open", priority: 1 });

    await expect(
      store.list("todos", {
        filter: { status: "open" },
        sort: { field: "priority", direction: "desc" },
        offset: 1,
        limit: 1,
      }),
    ).resolves.toEqual({ records: [second], total: 3 });
    await expect(
      store.list("todos", { offset: 10, limit: 1 }),
    ).resolves.toEqual({ records: [], total: 4 });
  });

  it("returns an empty list for a missing collection", async () => {
    expect(await store.list("missing")).toEqual({ records: [], total: 0 });
    expect(await store.get("missing", "1")).toBeUndefined();
  });

  it("persists records to disk across instances", async () => {
    const created = await createUser();

    const reloaded = new JsonFileRecordStore(rootDirectory);

    expect(await reloaded.get("users", created.id)).toEqual(created);
  });

  it("generates UUIDs across instances", async () => {
    const first = await createUser("Ada");

    const reloaded = new JsonFileRecordStore(rootDirectory);
    const second = await reloaded.create("users", { name: "Grace" });

    expect(first.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(second.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(second.id).not.toBe(first.id);
    expect((await reloaded.list("users")).records).toHaveLength(2);
  });

  it("serializes concurrent writes from instances sharing a collection", async () => {
    const otherStore = new JsonFileRecordStore(rootDirectory);
    const created = await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        (index % 2 === 0 ? store : otherStore).create("users", {
          name: `User ${index}`,
        }),
      ),
    );

    const persisted = await store.list("users");

    expect(persisted.records).toHaveLength(10);
    expect(persisted.total).toBe(10);
    expect(new Set(persisted.records.map((record) => record.id))).toEqual(
      new Set(created.map((record) => record.id)),
    );
    expect(persisted.records.map((record) => record.data.name).sort()).toEqual(
      Array.from({ length: 10 }, (_, index) => `User ${index}`).sort(),
    );
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

  it("generates a new UUID after deleting records", async () => {
    const created = await createUser();
    await store.delete("users", created.id);
    const replacement = await store.create("users", { name: "Ada" });

    expect(replacement.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(replacement.id).not.toBe(created.id);
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

    expect(await store.list("users")).toEqual({
      records: [{ id: expect.any(String), data: { name: "Ada" } }],
      total: 1,
    });
    expect(await store.list("posts")).toEqual({
      records: [{ id: expect.any(String), data: { title: "Hello" } }],
      total: 1,
    });
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
      RecordStoreReadError,
    );
  });

  it("throws a clear error on a malformed database file", async () => {
    await writeFile(
      path.join(rootDirectory, "users.json"),
      JSON.stringify({ notADatabase: true }),
    );

    const reloaded = new JsonFileRecordStore(rootDirectory);

    await expect(reloaded.list("users")).rejects.toBeInstanceOf(
      RecordStoreReadError,
    );
  });

  it("writes valid JSON that round-trips", async () => {
    const created = await createUser("Ada");

    const content = await readFile(
      path.join(rootDirectory, "users.json"),
      "utf8",
    );

    expect(JSON.parse(content)).toEqual({
      records: {
        [created.id]: { name: "Ada" },
      },
    });
  });

  it("reads the current file contents for every operation", async () => {
    const created = await createUser();
    await writeFile(
      path.join(rootDirectory, "users.json"),
      JSON.stringify({
        records: { [created.id]: { name: "Changed externally" } },
      }),
    );

    expect(await store.get("users", created.id)).toEqual({
      id: created.id,
      data: { name: "Changed externally" },
    });
  });
});
