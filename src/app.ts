import express from "express";
import { createSystemRouter } from "./routes/system.js";
import { SystemService } from "./services/system.js";

const app = express();

app.use(express.json());

const systemService = new SystemService();
app.use("/system", createSystemRouter(systemService));

export default app;
