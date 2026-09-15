import { Router, type Response } from "express";
import type { GetCurrentUserUseCase } from "../../application/auth/getCurrentUserUseCase.js";
import type { LoginUseCase } from "../../application/auth/loginUseCase.js";
import type { LogoutUseCase } from "../../application/auth/logoutUseCase.js";
import {
  AuthStorageError,
  InvalidTokenError,
  UserNotFoundError,
} from "../../application/authErrors.js";

function sendAuthError(res: Response, error: unknown): void {
  if (error instanceof UserNotFoundError) {
    res.status(401).json({
      error: "user_not_found",
      userId: error.userId,
    });
    return;
  }
  if (error instanceof InvalidTokenError) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (error instanceof AuthStorageError) {
    res.status(500).json({ error: "internal_server_error" });
    return;
  }
  throw error;
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }
  const parts = authHeader.trim().split(" ");
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer" || !parts[1]) {
    return null;
  }
  return parts[1];
}

type AuthRouteUseCases = {
  login: LoginUseCase;
  getCurrentUser: GetCurrentUserUseCase;
  logout: LogoutUseCase;
};

export function createAuthRouter({
  login,
  getCurrentUser,
  logout,
}: AuthRouteUseCases): Router {
  const router = Router();

  router.post("/login", async (req, res) => {
    const { userId } = req.body ?? {};

    if (typeof userId !== "string" || userId.length === 0) {
      res.status(400).json({ error: "invalid_user_id" });
      return;
    }

    try {
      const result = await login(userId);
      res.json(result);
    } catch (error) {
      sendAuthError(res, error);
    }
  });

  router.get("/me", async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }

    try {
      const user = await getCurrentUser(token);
      res.json(user);
    } catch (error) {
      sendAuthError(res, error);
    }
  });

  router.post("/logout", async (req, res) => {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      await logout(token);
      res.status(204).send();
    } catch (error) {
      sendAuthError(res, error);
    }
  });

  return router;
}
