import express, { type Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  httpErrorHandler,
  notFoundHandler,
} from "../../src/api/middleware/errorHandlers.js";

let app: Express;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeAll(async () => {
  vi.stubEnv("PERSISTENCE", "memory");
  vi.stubEnv("CORS_ORIGIN", "*");
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

  it("supports browser CORS requests and preflight", async () => {
    const response = await request(app)
      .get("/system/status")
      .set("Origin", "http://localhost:5173")
      .expect(200);
    expect(response.headers["access-control-allow-origin"]).toBe("*");

    const preflight = await request(app)
      .options("/files/http-contract/data.bin")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "PUT")
      .set("Access-Control-Request-Headers", "authorization,content-type")
      .expect(204);
    expect(preflight.headers["access-control-allow-origin"]).toBe("*");
    expect(preflight.headers["access-control-allow-methods"]).toBe(
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    expect(preflight.headers["access-control-allow-headers"]).toBe(
      "Authorization,Content-Type",
    );
    expect(preflight.text).toBe("");
  });

  it("allows PATCH collection preflight", async () => {
    const response = await request(app)
      .options("/collections/items/1")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "PATCH")
      .set("Access-Control-Request-Headers", "content-type")
      .expect(204);
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-methods"].split(",")).toContain("PATCH");
    expect(response.headers["access-control-allow-headers"]).toContain("Content-Type");
  });

  it("partially updates a collection record and keeps PUT as a replacement", async () => {
    const base = "/collections/http-contract-patch";
    const created = await request(app).post(base).send({
      name: "Ada", retained: true, profile: { city: "London", active: true }, note: "old",
    }).expect(201);
    const path = `${base}/${created.body.id}`;
    const updated = await request(app).patch(path).send({
      name: "Grace", added: 1, profile: { city: "Paris" }, note: null,
    }).expect(200);
    expect(updated.body).toEqual({
      id: created.body.id,
      data: { name: "Grace", retained: true, added: 1, profile: { city: "Paris" }, note: null },
    });
    expect((await request(app).get(path).expect(200)).body).toEqual(updated.body);
    const replaced = await request(app).put(path).send({ name: "Linus" }).expect(200);
    expect(replaced.body).toEqual({ id: created.body.id, data: { name: "Linus" } });
  });

  it("rejects invalid PATCH bodies and reports missing records", async () => {
    const path = "/collections/http-contract-patch-errors/missing";
    const array = await request(app).patch(path).send([]).expect(400);
    expect(array.body).toEqual({ error: "invalid_record" });
    for (const body of ["null", "42", '"text"', "true"]) {
      const response = await request(app).patch(path)
        .set("Content-Type", "application/json").send(body).expect(400);
      expect(response.body).toEqual({ error: "invalid_json" });
    }
    const missing = await request(app).patch(path).send({ name: "Grace" }).expect(404);
    expect(missing.body).toEqual({
      error: "not_found", collection: "http-contract-patch-errors", id: "missing",
    });
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
      total: 1, offset: 0, limit: null,
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

  it("filters collection records from query parameters", async () => {
    const first = await request(app)
      .post("/collections/http-contract-filter")
      .send({ status: "open", completed: false, priority: 3 })
      .expect(201);
    await request(app)
      .post("/collections/http-contract-filter")
      .send({ status: "done", completed: true, priority: 1 })
      .expect(201);

    const filtered = await request(app)
      .get("/collections/http-contract-filter")
      .query({
        "filter[status]": "open",
        "filter[completed]": "false",
        "filter[priority]": "3",
      })
      .expect(200);
    expect(filtered.body).toEqual({
      collection: "http-contract-filter",
      records: [first.body],
      total: 1, offset: 0, limit: null,
    });

    const byId = await request(app)
      .get("/collections/http-contract-filter")
      .query({ "filter[id]": first.body.id })
      .expect(200);
    expect(byId.body.records).toEqual([first.body]);

    const invalid = await request(app)
      .get("/collections/http-contract-filter?filter[]=open")
      .expect(400);
    expect(invalid.body).toEqual({ error: "invalid_filter" });
  });

  it("sorts and paginates filtered collection records", async () => {
    const path = "/collections/http-contract-pages";
    await request(app).post(path).send({ status: "open", rank: 1 }).expect(201);
    const middle = await request(app).post(path).send({ status: "open", rank: 2 }).expect(201);
    await request(app).post(path).send({ status: "open", rank: 3 }).expect(201);
    await request(app).post(path).send({ status: "done", rank: 4 }).expect(201);
    const response = await request(app).get(path).query({ "filter[status]": "open", sort: "rank:desc", offset: "1", limit: "1" }).expect(200);
    expect(response.body).toEqual({ collection: "http-contract-pages", records: [middle.body], total: 3, offset: 1, limit: 1 });
    const empty = await request(app).get(path).query({ offset: "20" }).expect(200);
    expect(empty.body).toEqual({ collection: "http-contract-pages", records: [], total: 4, offset: 20, limit: null });
  });

  it("rejects invalid sort and pagination parameters", async () => {
    for (const query of ["sort=name", "sort=:asc", "sort=name:up", "sort=name:asc&sort=id:desc"]) {
      const response = await request(app).get(`/collections/items?${query}`).expect(400);
      expect(response.body).toEqual({ error: "invalid_sort" });
    }
    for (const query of ["offset=-1", "offset=1.5", "offset=", "offset=9007199254740992", "limit=0", "limit=-1", "limit=1&limit=2"]) {
      const response = await request(app).get(`/collections/items?${query}`).expect(400);
      expect(response.body).toEqual({ error: "invalid_pagination" });
    }
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

  it("uploads multipart file content with Multer", async () => {
    const content = Buffer.from([255, 128, 127, 2, 1, 0]);

    await request(app)
      .post("/files/http-contract/multipart.bin")
      .attach("file", content, {
        filename: "source.bin",
        contentType: "application/custom",
      })
      .expect(204);

    const downloaded = await request(app)
      .get("/files/http-contract/multipart.bin")
      .expect("Content-Type", "application/octet-stream")
      .expect(200);
    expect(downloaded.body).toEqual(content);

    await request(app)
      .delete("/files/http-contract/multipart.bin")
      .expect(204);
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

    const malformedJson = await request(app)
      .post("/collections/http-contract-invalid")
      .set("Content-Type", "application/json")
      .send('{"name":')
      .expect(400);
    expect(malformedJson.body).toEqual({ error: "invalid_json" });

    const oversizedJson = await request(app)
      .post("/collections/http-contract-invalid")
      .send({ value: "x".repeat(101 * 1024) })
      .expect(413);
    expect(oversizedJson.body).toEqual({ error: "payload_too_large" });

    const unknownRoute = await request(app).get("/unknown-route").expect(404);
    expect(unknownRoute.body).toEqual({ error: "route_not_found" });

    const missingFile = await request(app)
      .post("/files/http-contract/missing-file.bin")
      .field("description", "no file attached")
      .expect(400);
    expect(missingFile.body).toEqual({ error: "invalid_file" });

    const wrongFileField = await request(app)
      .post("/files/http-contract/wrong-field.bin")
      .attach("attachment", Buffer.from("content"), "source.txt")
      .expect(400);
    expect(wrongFileField.body).toEqual({ error: "invalid_file" });
  });

  it("hides details of unexpected errors", async () => {
    const failingApp = express();
    failingApp.get("/boom", async () => {
      throw new Error("sensitive detail");
    });
    failingApp.use(notFoundHandler);
    failingApp.use(httpErrorHandler);

    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await request(failingApp).get("/boom").expect(500);
      expect(response.body).toEqual({ error: "internal_server_error" });
      expect(response.text).not.toContain("sensitive detail");
      expect(errorLog).toHaveBeenCalledOnce();
    } finally {
      errorLog.mockRestore();
    }
  });
});
