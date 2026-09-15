import { Router } from "express";
import type { GetSystemStatusUseCase } from "../../application/system/getSystemStatusUseCase.js";
import type { GetSystemUptimeUseCase } from "../../application/system/getSystemUptimeUseCase.js";

type SystemRouteUseCases = {
  getSystemStatus: GetSystemStatusUseCase;
  getSystemUptime: GetSystemUptimeUseCase;
};

export function createSystemRouter({
  getSystemStatus,
  getSystemUptime,
}: SystemRouteUseCases): Router {
  const router = Router();

  router.get("/status", (_req, res) => {
    res.json(getSystemStatus());
  });

  router.get("/uptime", (_req, res) => {
    res.json(getSystemUptime());
  });

  return router;
}
