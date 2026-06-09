import express from "express";
import { createSystemRouter } from "./system/route.js";
import { createCollectionsRouter } from "./db/route.js";
import { SystemService } from "./system/system.js";
import { InMemoryDatabase } from "./db/implementations/inMemoryDatabase.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

const database = new InMemoryDatabase();
app.use("/collections", createCollectionsRouter(database));

export default app;
