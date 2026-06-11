import express from "express";
import { createSystemRouter } from "./system/route.js";
import { createCollectionsRouter } from "./db/route.js";
import { SystemService } from "./system/system.js";
import { DatabaseService } from "./db/databaseService.js";
import { InMemoryRecordStore } from "./db/implementations/inMemoryRecordStore.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

const recordStore = new InMemoryRecordStore();
const databaseService = new DatabaseService(recordStore);
app.use("/collections", createCollectionsRouter(databaseService));

export default app;
