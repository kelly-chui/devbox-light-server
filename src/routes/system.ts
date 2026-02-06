import { Router } from "express";

const systemRouter = Router();

systemRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

export default systemRouter;
