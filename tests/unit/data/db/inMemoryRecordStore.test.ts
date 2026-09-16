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

    expect(records).toHaveLength(2);
    expect(records[0]?.data).toEqual({ name: "Ada" });
    expect(records[1]?.data).toEqual({ name: "Linus" });
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
    ).resolves.toEqual([open]);
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

    expect(await store.list("users")).toEqual([
      {
        id: expect.any(String),
        data: {
          name: "Ada",
        },
      },
    ]);

    expect(await store.list("posts")).toEqual([
      {
        id: expect.any(String),
        data: {
          title: "Hello",
        },
      },
    ]);
  });
});
