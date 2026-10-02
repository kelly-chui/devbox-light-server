import express from "express";
import { randomUUID } from "node:crypto";
import { createSystemRouter } from "./api/routes/systemRoute.js";
import { createCollectionsRouter } from "./api/routes/dbRoute.js";
import { createGetSystemStatusUseCase } from "./application/system/getSystemStatusUseCase.js";
import { createGetSystemUptimeUseCase } from "./application/system/getSystemUptimeUseCase.js";
import { SystemRepository } from "./domain/system/system.js";
import {
  createCreateRecordUseCase,
  createDeleteRecordUseCase,
  createGetRecordUseCase,
  createListRecordsUseCase,
  createReplaceRecordUseCase,
  createUpdateRecordUseCase,
} from "./application/database/index.js";
import {
  createDeleteFileUseCase,
  createGetFileUseCase,
  createPutFileUseCase,
} from "./application/storage/index.js";
import { createStorageRouter } from "./api/routes/storageRoute.js";
import {
  createGetCurrentUserUseCase,
  createLoginUseCase,
  createLogoutUseCase,
} from "./application/auth/index.js";
import { createAuthRouter } from "./api/routes/authRoute.js";
import { createRuntimeStores, readPersistenceMode } from "./config/runtime.js";
import { httpErrorHandler, notFoundHandler } from "./api/middleware/errorHandlers.js";
import { createCorsMiddleware, readCorsOrigin } from "./api/middleware/cors.js";

const app = express();

app.use(createCorsMiddleware(readCorsOrigin(process.env.CORS_ORIGIN)));
app.use(express.json());

const now = () => Date.now();
const systemRepository = new SystemRepository({ startedAt: now() });
const getSystemStatus = createGetSystemStatusUseCase({ now });
const getSystemUptime = createGetSystemUptimeUseCase({ systemRepository, now });
app.use("/system", createSystemRouter({ getSystemStatus, getSystemUptime }));

const persistenceMode = readPersistenceMode(process.env.PERSISTENCE);
const dataDirectory = process.env.DB_DATA_DIR ?? ".data";
const { recordStore, tokenStore, fileStorage } = createRuntimeStores(
  persistenceMode,
  dataDirectory,
);

const listRecords = createListRecordsUseCase({ recordStore });
const getRecord = createGetRecordUseCase({ recordStore });
const createRecord = createCreateRecordUseCase({ recordStore });
const replaceRecord = createReplaceRecordUseCase({ recordStore });
const updateRecord = createUpdateRecordUseCase({ recordStore });
const deleteRecord = createDeleteRecordUseCase({ recordStore });
app.use(
  "/collections",
  createCollectionsRouter({
    listRecords,
    getRecord,
    createRecord,
    replaceRecord,
    updateRecord,
    deleteRecord,
  }),
);

const login = createLoginUseCase({
  recordStore,
  tokenStore,
  createToken: randomUUID,
});
const getCurrentUser = createGetCurrentUserUseCase({ recordStore, tokenStore });
const logout = createLogoutUseCase({ tokenStore });
app.use("/auth", createAuthRouter({ login, getCurrentUser, logout }));

const getFile = createGetFileUseCase({ fileStorage });
const putFile = createPutFileUseCase({ fileStorage });
const deleteFile = createDeleteFileUseCase({ fileStorage });
app.use("/files", createStorageRouter({ getFile, putFile, deleteFile }));

app.use(notFoundHandler);
app.use(httpErrorHandler);

export default app;
