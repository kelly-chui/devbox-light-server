import { Router, type Response } from "express";
import type { RecordData } from "./types.js";
import type { RecordStore } from "./recordStore.js";
import { RecordNotFoundError } from "./errors.js";

function isRecordData(value: unknown): value is RecordData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readCollection(collection: string | undefined): string | null {
  if (typeof collection !== "string" || collection.length === 0) {
    return null;
  }
  return collection;
}

function readRecordParams(
  collection: string | undefined,
  id: string | undefined,
): { collection: string; id: string } | null {
  const collectionName = readCollection(collection);
  if (collectionName === null) {
    return null;
  }
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  return { collection: collectionName, id };
}

function sendDatabaseError(res: Response, error: unknown): void {
  if (error instanceof RecordNotFoundError) {
    res.status(404).json({
      error: "not_found",
      collection: error.collection,
      id: error.id,
    });
    return;
  }
  throw error;
}

export function createCollectionsRouter(recordStore: RecordStore): Router {
  const router = Router();

  router.get("/:collection", async (req, res) => {
    const collection = readCollection(req.params.collection);
    if (collection === null) {
      res.status(400).json({ error: "invalid_collection" });
      return;
    }
    try {
      const records = await recordStore.list(collection);
      res.json({ collection, records });
    } catch (error) {
      sendDatabaseError(res, error);
    }
  });

  router.get("/:collection/:id", async (req, res) => {
    const params = readRecordParams(req.params.collection, req.params.id);
    if (params === null) {
      res.status(400).json({ error: "invalid_params" });
      return;
    }
    try {
      const record = await recordStore.get(params.collection, params.id);
      if (record === undefined) {
        res.status(404).json({
          error: "not_found",
          collection: params.collection,
          id: params.id,
        });
        return;
      }
      res.json(record);
    } catch (error) {
      sendDatabaseError(res, error);
    }
  });

  router.post("/:collection", async (req, res) => {
    const collection = readCollection(req.params.collection);
    if (collection === null) {
      res.status(400).json({ error: "invalid_collection" });
      return;
    }
    if (!isRecordData(req.body)) {
      res.status(400).json({ error: "invalid_record" });
      return;
    }
    try {
      const record = await recordStore.create(collection, req.body);
      res.status(201).json(record);
    } catch (error) {
      sendDatabaseError(res, error);
    }
  });

  router.put("/:collection/:id", async (req, res) => {
    const params = readRecordParams(req.params.collection, req.params.id);
    if (params === null) {
      res.status(400).json({ error: "invalid_params" });
      return;
    }
    if (!isRecordData(req.body)) {
      res.status(400).json({ error: "invalid_record" });
      return;
    }
    try {
      await recordStore.replace(params.collection, params.id, req.body);
      const record = await recordStore.get(
        params.collection,
        params.id,
      );
      res.json(record);
    } catch (error) {
      sendDatabaseError(res, error);
    }
  });

  router.delete("/:collection/:id", async (req, res) => {
    const params = readRecordParams(req.params.collection, req.params.id);
    if (params === null) {
      res.status(400).json({ error: "invalid_params" });
      return;
    }
    try {
      const deleted = await recordStore.delete(params.collection, params.id);
      if (!deleted) {
        res.status(404).json({
          error: "not_found",
          collection: params.collection,
          id: params.id,
        });
        return;
      }
      res.status(204).send();
    } catch (error) {
      sendDatabaseError(res, error);
    }
  });

  return router;
}
