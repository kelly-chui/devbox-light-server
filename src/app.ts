import express from "express";
import path from "node:path";
import { createSystemRouter } from "./system/route.js";
import { createCollectionsRouter } from "./db/route.js";
import { SystemService } from "./system/system.js";
import { DatabaseService } from "./db/databaseService.js";
import { JsonFileRecordStore } from "./db/implementations/jsonFileRecordStore.js";
import { StorageService } from "./storage/storageService.js";
import { createStorageRouter } from "./storage/route.js";
import { LocalFileStorage } from "./storage/implementations/localFileStorage.js";
import { JsonFileTokenStore } from "./auth/implementations/jsonFileTokenStore.js";
import { AuthService } from "./auth/authService.js";
import { createAuthRouter } from "./auth/route.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

const dataDirectory = process.env.DB_DATA_DIR ?? ".data";

const recordStore = new JsonFileRecordStore(dataDirectory);
const databaseService = new DatabaseService(recordStore);
app.use("/collections", createCollectionsRouter(databaseService));

const tokenStore = new JsonFileTokenStore(dataDirectory);
const authService = new AuthService(databaseService, tokenStore);
app.use("/auth", createAuthRouter(authService));

const fileStorage = new LocalFileStorage(path.join(dataDirectory, "files"));
const storageService = new StorageService(fileStorage);
app.use("/files", createStorageRouter(storageService));

export default app;
