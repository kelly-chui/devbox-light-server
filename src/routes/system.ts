import { Router } from "express";
import type { SystemService } from "../services/system.js";

export function createSystemRouter(systemService: SystemService): Router {
  const router = Router();

  router.get("/status", (_req, res) => {
    res.json(systemService.getStatus());
  });

  router.get("/uptime", (_req, res) => {
    res.json(systemService.getUptime());
  });

  return router;
}
