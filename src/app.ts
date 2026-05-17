import express from "express";
import dbRouter from "./routes/db";
import healthRouter from "./routes/health";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/db", dbRouter);

export default app;
