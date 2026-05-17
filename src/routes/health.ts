import { Router } from "express";
import { getHealthStatus } from "../services/healthService";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json(getHealthStatus());
});

export default healthRouter;
