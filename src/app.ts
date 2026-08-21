import express from "express";
import { createSystemRouter } from "./api/routes/systemRoute.js";
import { createCollectionsRouter } from "./api/routes/dbRoute.js";
import { SystemUseCases } from "./application/systemUseCases.js";
import { SystemRepository } from "./domain/system/system.js";
import { DatabaseUseCases } from "./application/databaseUseCases.js";
import { StorageUseCases } from "./application/storageUseCases.js";
import { createStorageRouter } from "./api/routes/storageRoute.js";
import { AuthUseCases } from "./application/authUseCases.js";
import { createAuthRouter } from "./api/routes/authRoute.js";
import { createRuntimeStores, readPersistenceMode } from "./config/runtime.js";
import { httpErrorHandler, notFoundHandler } from "./api/middleware/errorHandlers.js";
import { createCorsMiddleware, readCorsOrigin } from "./api/middleware/cors.js";

const app = express();

app.use(createCorsMiddleware(readCorsOrigin(process.env.CORS_ORIGIN)));
app.use(express.json());

const systemRepository = new SystemRepository();
const systemUseCases = new SystemUseCases(systemRepository);
app.use("/system", createSystemRouter(systemUseCases));

const persistenceMode = readPersistenceMode(process.env.PERSISTENCE);
const dataDirectory = process.env.DB_DATA_DIR ?? ".data";
const { recordStore, tokenStore, fileStorage } = createRuntimeStores(
  persistenceMode,
  dataDirectory,
);

const databaseUseCases = new DatabaseUseCases(recordStore);
app.use("/collections", createCollectionsRouter(databaseUseCases));

const authUseCases = new AuthUseCases(databaseUseCases, tokenStore);
app.use("/auth", createAuthRouter(authUseCases));

const storageUseCases = new StorageUseCases(fileStorage);
app.use("/files", createStorageRouter(storageUseCases));

app.use(notFoundHandler);
app.use(httpErrorHandler);

export default app;
