import express from "express";
import { createSystemRouter } from "./routes/system.js";
import { createCollectionsRouter } from "./routes/database.js";
import { SystemService } from "./services/system.js";
import { InMemoryDatabase } from "./db/inMemoryDatabase.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

const database = new InMemoryDatabase();
app.use("/collections", createCollectionsRouter(database));

export default app;
