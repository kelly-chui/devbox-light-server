import { describe, expect, it } from "vitest";
import { InMemoryDatabase } from "../../../src/db/implementations/inMemoryDatabase.js";
import { RecordNotFoundError } from "../../../src/db/errors.js";

async function createUser(
  db: InMemoryDatabase,
  name = "Ada",
) {
  return db.create("users", { name });
}

describe("InMemoryDatabase", () => {
  it("creates and gets records", async () => {
    const db = new InMemoryDatabase();

    const created = await createUser(db);

    expect(created.id).toBeDefined();
    expect(created.data).toEqual({ name: "Ada" });

    const fetched = await db.get("users", created.id);

    expect(fetched).toEqual(created);
  });

  it("lists records in insertion order per collection", async () => {
    const db = new InMemoryDatabase();

    await createUser(db, "Ada");
    await createUser(db, "Linus");

    const records = await db.list("users");

    expect(records).toHaveLength(2);
    expect(records[0]?.data).toEqual({ name: "Ada" });
    expect(records[1]?.data).toEqual({ name: "Linus" });
  });

  it("replaces existing records", async () => {
    const db = new InMemoryDatabase();

    const created = await createUser(db);

    await db.replace("users", created.id, {
      name: "Grace",
    });

    expect(await db.get("users", created.id)).toEqual({
      id: created.id,
      data: {
        name: "Grace",
      },
    });
  });

  it("throws when replacing a missing record", async () => {
    const db = new InMemoryDatabase();

    await expect(
      db.replace("users", "999", {
        nope: true,
      }),
    ).rejects.toBeInstanceOf(RecordNotFoundError);
  });

  it("deletes records", async () => {
    const db = new InMemoryDatabase();

    const created = await createUser(db);

    expect(await db.delete("users", created.id)).toBe(true);
    expect(await db.get("users", created.id)).toBeUndefined();
  });

  it("returns false when deleting a missing record", async () => {
    const db = new InMemoryDatabase();

    expect(await db.delete("users", "999")).toBe(false);
    expect(await db.delete("missing", "1")).toBe(false);
  });

  it("does not leak stored data references", async () => {
    const db = new InMemoryDatabase();

    const payload = {
      profile: {
        name: "Ada",
      },
    };

    const created = await db.create("users", payload);

    payload.profile.name = "MUTATED";
    created.data.profile = {
      name: "MUTATED2",
    };

    expect(await db.get("users", created.id)).toEqual({
      id: created.id,
      data: {
        profile: {
          name: "Ada",
        },
      },
    });
  });

  it("isolates collections", async () => {
    const db = new InMemoryDatabase();

    await db.create("users", {
      name: "Ada",
    });

    await db.create("posts", {
      title: "Hello",
    });

    expect(await db.list("users")).toEqual([
      {
        id: expect.any(String),
        data: {
          name: "Ada",
        },
      },
    ]);

    expect(await db.list("posts")).toEqual([
      {
        id: expect.any(String),
        data: {
          title: "Hello",
        },
      },
    ]);
  });
});
