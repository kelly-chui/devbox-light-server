import { describe, expect, it } from "vitest";
import { InMemoryRecordStore } from "../../../../src/data/db/inMemoryRecordStore.js";
import { RecordNotFoundError } from "../../../../src/domain/db/recordStore.js";

async function createUser(
  store: InMemoryRecordStore,
  name = "Ada",
) {
  return store.create("users", { name });
}

describe("InMemoryRecordStore", () => {
  it("creates and gets records", async () => {
    const store = new InMemoryRecordStore();

    const created = await createUser(store);

    expect(created.id).toBeDefined();
    expect(created.data).toEqual({ name: "Ada" });

    const fetched = await store.get("users", created.id);

    expect(fetched).toEqual(created);
  });

  it("lists records in insertion order per collection", async () => {
    const store = new InMemoryRecordStore();

    await createUser(store, "Ada");
    await createUser(store, "Linus");

    const records = await store.list("users");

    expect(records).toEqual({
      records: [
        { id: "1", data: { name: "Ada" } },
        { id: "2", data: { name: "Linus" } },
      ],
      total: 2,
    });
  });

  it("filters records by exact top-level fields with AND semantics", async () => {
    const store = new InMemoryRecordStore();
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
    const store = new InMemoryRecordStore();
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
    const store = new InMemoryRecordStore();
    await store.create("todos", { status: "done", priority: 1 });
    const second = await store.create("todos", { status: "open", priority: 2 });
    const third = await store.create("todos", { status: "open", priority: 3 });
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

  it("replaces existing records", async () => {
    const store = new InMemoryRecordStore();

    const created = await createUser(store);

    await store.replace("users", created.id, {
      name: "Grace",
    });

    expect(await store.get("users", created.id)).toEqual({
      id: created.id,
      data: {
        name: "Grace",
      },
    });
  });

  it("throws when replacing a missing record", async () => {
    const store = new InMemoryRecordStore();

    await expect(
      store.replace("users", "999", {
        nope: true,
      }),
    ).rejects.toBeInstanceOf(RecordNotFoundError);
  });

  it("deletes records", async () => {
    const store = new InMemoryRecordStore();

    const created = await createUser(store);

    expect(await store.delete("users", created.id)).toBe(true);
    expect(await store.get("users", created.id)).toBeUndefined();
  });

  it("returns false when deleting a missing record", async () => {
    const store = new InMemoryRecordStore();

    expect(await store.delete("users", "999")).toBe(false);
    expect(await store.delete("missing", "1")).toBe(false);
  });

  it("does not leak stored data references", async () => {
    const store = new InMemoryRecordStore();

    const payload = {
      profile: {
        name: "Ada",
      },
    };

    const created = await store.create("users", payload);

    payload.profile.name = "MUTATED";
    created.data.profile = {
      name: "MUTATED2",
    };

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
    const store = new InMemoryRecordStore();

    await store.create("users", {
      name: "Ada",
    });

    await store.create("posts", {
      title: "Hello",
    });

    expect(await store.list("users")).toEqual({
      records: [
        {
          id: expect.any(String),
          data: {
            name: "Ada",
          },
        },
      ],
      total: 1,
    });

    expect(await store.list("posts")).toEqual({
      records: [
        {
          id: expect.any(String),
          data: {
            title: "Hello",
          },
        },
      ],
      total: 1,
    });
  });
});
