import express from "express";
import { createSystemRouter } from "./system/route.js";
import { createCollectionsRouter } from "./db/route.js";
import { SystemService } from "./system/system.js";
import { DatabaseService } from "./db/databaseService.js";
import { InMemoryRecordStore } from "./db/implementations/inMemoryRecordStore.js";
import { LocalFileStorage } from "./storage/implementations/localFileStorage.js";
import { StorageService } from "./storage/storageService.js";
import { createStorageRouter } from "./storage/route.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

const recordStore = new InMemoryRecordStore();
const databaseService = new DatabaseService(recordStore);
app.use("/collections", createCollectionsRouter(databaseService));

const fileStorage = new LocalFileStorage("./data/storage");
const storageService = new StorageService(fileStorage);
app.use("/files", createStorageRouter(storageService));

export default app;
