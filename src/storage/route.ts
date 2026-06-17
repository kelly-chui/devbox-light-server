import express, { Router, type Response } from "express";
import type { StorageService } from "./storageService.js";
import { FileNotFoundError, PathTraversalError } from "./errors.js";

function getStorageKey(path: string): string | null {
  const key = path.substring(1);
  if (key.length === 0) {
    return null;
  }
  return key;
}

function sendStorageError(res: Response, error: unknown): void {
  if (error instanceof FileNotFoundError) {
    res.status(404).json({
      error: "not_found",
      key: error.key,
    });
    return;
  }
  if (error instanceof PathTraversalError) {
    res.status(400).json({
      error: "path_traversal",
      key: error.key,
    });
    return;
  }
  throw error;
}

export function createStorageRouter(storageService: StorageService): Router {
  const router = Router();

  router.get(/(.*)/, async (req, res) => {
    const key = getStorageKey(req.path);
    if (key === null) {
      res.status(400).json({ error: "invalid_key" });
      return;
    }
    try {
      const content = await storageService.getFile(key);
      res.setHeader("Content-Type", "application/octet-stream");
      res.send(Buffer.from(content));
    } catch (error) {
      sendStorageError(res, error);
    }
  });

  router.put(
    /(.*)/,
    express.raw({ type: "*/*", limit: "50mb" }),
    async (req, res) => {
      const key = getStorageKey(req.path);
      if (key === null) {
        res.status(400).json({ error: "invalid_key" });
        return;
      }
      if (!(req.body instanceof Buffer)) {
        res.status(400).json({ error: "invalid_body" });
        return;
      }
      try {
        await storageService.putFile(key, new Uint8Array(req.body));
        res.status(204).send();
      } catch (error) {
        sendStorageError(res, error);
      }
    },
  );

  router.delete(/(.*)/, async (req, res) => {
    const key = getStorageKey(req.path);
    if (key === null) {
      res.status(400).json({ error: "invalid_key" });
      return;
    }
    try {
      await storageService.deleteFile(key);
      res.status(204).send();
    } catch (error) {
      sendStorageError(res, error);
    }
  });

  return router;
}
