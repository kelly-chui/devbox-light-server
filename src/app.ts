import express from "express";
import { createSystemRouter } from "./system/route.js";
import { createCollectionsRouter } from "./db/route.js";
import { SystemService } from "./system/system.js";
import { InMemoryRecordStore } from "./db/implementations/inMemoryRecordStore.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

const recordStore = new InMemoryRecordStore();
app.use("/collections", createCollectionsRouter(recordStore));

export default app;
