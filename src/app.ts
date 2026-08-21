import express from "express";
import { createSystemRouter } from "./system/route.js";
import { createCollectionsRouter } from "./db/route.js";
import { SystemService } from "./system/systemService.js";
import { SystemRepository } from "./system/system.js";
import { DatabaseService } from "./db/databaseService.js";
import { StorageService } from "./storage/storageService.js";
import { createStorageRouter } from "./storage/route.js";
import { AuthService } from "./auth/authService.js";
import { createAuthRouter } from "./auth/route.js";
import { createRuntimeStores, readPersistenceMode } from "./runtime.js";
import { jsonErrorHandler, notFoundHandler } from "./http/errorHandlers.js";
import { createCorsMiddleware, readCorsOrigin } from "./http/cors.js";

const app = express();

app.use(createCorsMiddleware(readCorsOrigin(process.env.CORS_ORIGIN)));
app.use(express.json());

const systemRepository = new SystemRepository();
const systemService = new SystemService(systemRepository);
app.use("/system", createSystemRouter(systemService));

const persistenceMode = readPersistenceMode(process.env.PERSISTENCE);
const dataDirectory = process.env.DB_DATA_DIR ?? ".data";
const { recordStore, tokenStore, fileStorage } = createRuntimeStores(
  persistenceMode,
  dataDirectory,
);

const databaseService = new DatabaseService(recordStore);
app.use("/collections", createCollectionsRouter(databaseService));

const authService = new AuthService(databaseService, tokenStore);
app.use("/auth", createAuthRouter(authService));

const storageService = new StorageService(fileStorage);
app.use("/files", createStorageRouter(storageService));

app.use(notFoundHandler);
app.use(jsonErrorHandler);

export default app;
