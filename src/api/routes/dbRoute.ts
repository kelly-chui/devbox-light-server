import { Router, type Response } from "express";
import type { CreateRecordUseCase } from "../../application/database/createRecordUseCase.js";
import type { DeleteRecordUseCase } from "../../application/database/deleteRecordUseCase.js";
import type { GetRecordUseCase } from "../../application/database/getRecordUseCase.js";
import type { ListRecordsUseCase } from "../../application/database/listRecordsUseCase.js";
import type { ReplaceRecordUseCase } from "../../application/database/replaceRecordUseCase.js";
import type { RecordData } from "../../domain/db/types.js";
import {
  DatabaseInvalidCollectionError,
  DatabaseReadError,
  DatabaseRecordNotFoundError,
  DatabaseWriteError,
} from "../../application/databaseErrors.js";

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
  if (error instanceof DatabaseInvalidCollectionError) {
    res.status(400).json({
      error: "invalid_collection",
      collection: error.collection,
    });
    return;
  }
  if (error instanceof DatabaseRecordNotFoundError) {
    res.status(404).json({
      error: "not_found",
      collection: error.collection,
      id: error.id,
    });
    return;
  }
  if (error instanceof DatabaseReadError || error instanceof DatabaseWriteError) {
    res.status(500).json({ error: "internal_server_error" });
    return;
  }
  throw error;
}

type CollectionRouteUseCases = {
  listRecords: ListRecordsUseCase;
  getRecord: GetRecordUseCase;
  createRecord: CreateRecordUseCase;
  replaceRecord: ReplaceRecordUseCase;
  deleteRecord: DeleteRecordUseCase;
};

export function createCollectionsRouter({
  listRecords,
  getRecord,
  createRecord,
  replaceRecord,
  deleteRecord,
}: CollectionRouteUseCases): Router {
  const router = Router();

  router.get("/:collection", async (req, res) => {
    const collection = readCollection(req.params.collection);
    if (collection === null) {
      res.status(400).json({ error: "invalid_collection" });
      return;
    }
    try {
      const records = await listRecords(collection);
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
      const record = await getRecord(
        params.collection,
        params.id,
      );
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
      const record = await createRecord(collection, req.body);
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
      const record = await replaceRecord(
        params.collection,
        params.id,
        req.body,
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
      await deleteRecord(params.collection, params.id);
      res.status(204).send();
    } catch (error) {
      sendDatabaseError(res, error);
    }
  });

  return router;
}
