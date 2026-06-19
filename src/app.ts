import express from "express";
import { createSystemRouter } from "./system/route.js";
import { createCollectionsRouter } from "./db/route.js";
import { SystemService } from "./system/system.js";
import { DatabaseService } from "./db/databaseService.js";
import { InMemoryRecordStore } from "./db/implementations/inMemoryRecordStore.js";
import { InMemoryFileStorage } from "./storage/implementations/inMemoryFileStorage.js";
import { StorageService } from "./storage/storageService.js";
import { createStorageRouter } from "./storage/route.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

const recordStore = new InMemoryRecordStore();
const databaseService = new DatabaseService(recordStore);
app.use("/collections", createCollectionsRouter(databaseService));

const fileStorage = new InMemoryFileStorage();
const storageService = new StorageService(fileStorage);
app.use("/files", createStorageRouter(storageService));

export default app;
