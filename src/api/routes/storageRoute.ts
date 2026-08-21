import express, { Router, type ErrorRequestHandler, type Response } from "express";
import multer from "multer";
import { MulterError } from "multer";
import type { StorageUseCases } from "../../application/storageUseCases.js";
import {
  FileNotFoundError,
  PathTraversalError,
  StorageError,
} from "../../application/storageErrors.js";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const multipartUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

const storageUploadErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (
    error instanceof MulterError &&
    error.code === "LIMIT_FILE_SIZE"
  ) {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    res.status(413).json({ error: "payload_too_large" });
    return;
  }

  if (error instanceof MulterError) {
    res.status(400).json({ error: "invalid_file" });
    return;
  }

  next(error);
};

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
  if (error instanceof StorageError) {
    res.status(500).json({ error: "internal_server_error" });
    return;
  }
  throw error;
}

export function createStorageRouter(storageUseCases: StorageUseCases): Router {
  const router = Router();

  router.get(/(.*)/, async (req, res) => {
    const key = getStorageKey(req.path);
    if (key === null) {
      res.status(400).json({ error: "invalid_key" });
      return;
    }
    try {
      const content = await storageUseCases.getFile(key);
      res.setHeader("Content-Type", "application/octet-stream");
      res.send(Buffer.from(content));
    } catch (error) {
      sendStorageError(res, error);
    }
  });

  router.put(
    /(.*)/,
    express.raw({ type: "*/*", limit: MAX_FILE_SIZE_BYTES }),
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
        await storageUseCases.putFile(key, new Uint8Array(req.body));
        res.status(204).send();
      } catch (error) {
        sendStorageError(res, error);
      }
    },
  );

  router.post(
    /(.*)/,
    multipartUpload.single("file"),
    async (req, res) => {
      const key = getStorageKey(req.path);
      if (key === null) {
        res.status(400).json({ error: "invalid_key" });
        return;
      }
      if (req.file === undefined) {
        res.status(400).json({ error: "invalid_file" });
        return;
      }
      try {
        await storageUseCases.putFile(key, new Uint8Array(req.file.buffer));
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
      await storageUseCases.deleteFile(key);
      res.status(204).send();
    } catch (error) {
      sendStorageError(res, error);
    }
  });

  router.use(storageUploadErrorHandler);

  return router;
}
