import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let app: Express;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeAll(async () => {
  vi.stubEnv("PERSISTENCE", "memory");
  ({ default: app } = await import("../../src/app.js"));
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe("HTTP API contract", () => {
  it("serves system status as JSON", async () => {
    const response = await request(app).get("/system/status").expect(200);

    expect(response.headers["content-type"]).toMatch(/application\/json/);
    expect(response.body.status).toBe("ok");
    expect(new Date(response.body.timestamp).toISOString()).toBe(
      response.body.timestamp,
    );
  });

  it("supports the collection CRUD flow", async () => {
    const created = await request(app)
      .post("/collections/http-contract-items")
      .send({ name: "first" })
      .expect(201);

    expect(created.body).toEqual({
      id: expect.any(String),
      data: { name: "first" },
    });
    expect(created.body.id).not.toBe("");

    const id = created.body.id as string;
    const fetched = await request(app)
      .get(`/collections/http-contract-items/${id}`)
      .expect(200);
    expect(fetched.body).toEqual(created.body);

    const replaced = await request(app)
      .put(`/collections/http-contract-items/${id}`)
      .send({ name: "updated" })
      .expect(200);
    expect(replaced.body).toEqual({ id, data: { name: "updated" } });

    const listed = await request(app)
      .get("/collections/http-contract-items")
      .expect(200);
    expect(listed.body).toEqual({
      collection: "http-contract-items",
      records: [replaced.body],
    });

    await request(app)
      .delete(`/collections/http-contract-items/${id}`)
      .expect(204);

    const missing = await request(app)
      .get(`/collections/http-contract-items/${id}`)
      .expect(404);
    expect(missing.body).toEqual({
      error: "not_found",
      collection: "http-contract-items",
      id,
    });
  });

  it("supports login, authenticated lookup, and logout", async () => {
    const createdUser = await request(app)
      .post("/collections/users")
      .send({ name: "HTTP Contract User" })
      .expect(201);

    const login = await request(app)
      .post("/auth/login")
      .send({ userId: createdUser.body.id })
      .expect(200);
    expect(login.body).toEqual({
      accessToken: expect.stringMatching(UUID_PATTERN),
      user: createdUser.body,
    });

    const authorization = `Bearer ${login.body.accessToken}`;
    const me = await request(app)
      .get("/auth/me")
      .set("Authorization", authorization)
      .expect(200);
    expect(me.body).toEqual(createdUser.body);

    await request(app)
      .post("/auth/logout")
      .set("Authorization", authorization)
      .expect(204);

    const loggedOut = await request(app)
      .get("/auth/me")
      .set("Authorization", authorization)
      .expect(401);
    expect(loggedOut.body).toEqual({ error: "unauthorized" });
  });

  it("uploads, downloads, and deletes raw file content", async () => {
    const content = Buffer.from([0, 1, 2, 127, 128, 255]);

    await request(app)
      .put("/files/http-contract/data.bin")
      .set("Content-Type", "application/octet-stream")
      .send(content)
      .expect(204);

    const downloaded = await request(app)
      .get("/files/http-contract/data.bin")
      .expect("Content-Type", "application/octet-stream")
      .expect(200);
    expect(downloaded.body).toEqual(content);

    await request(app)
      .delete("/files/http-contract/data.bin")
      .expect(204);

    const missing = await request(app)
      .get("/files/http-contract/data.bin")
      .expect(404);
    expect(missing.body).toEqual({
      error: "not_found",
      key: "http-contract/data.bin",
    });
  });

  it("returns documented JSON errors for invalid requests", async () => {
    const invalidRecord = await request(app)
      .post("/collections/http-contract-invalid")
      .send([])
      .expect(400);
    expect(invalidRecord.body).toEqual({ error: "invalid_record" });

    const invalidLogin = await request(app)
      .post("/auth/login")
      .send({})
      .expect(400);
    expect(invalidLogin.body).toEqual({ error: "invalid_user_id" });

    const unauthorized = await request(app).get("/auth/me").expect(401);
    expect(unauthorized.body).toEqual({ error: "unauthorized" });
  });
});
