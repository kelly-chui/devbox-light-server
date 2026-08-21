import { Router } from "express";
import type { SystemUseCases } from "../../application/systemUseCases.js";

export function createSystemRouter(systemUseCases: SystemUseCases): Router {
  const router = Router();

  router.get("/status", (_req, res) => {
    res.json(systemUseCases.getStatus());
  });

  router.get("/uptime", (_req, res) => {
    res.json(systemUseCases.getUptime());
  });

  return router;
}
