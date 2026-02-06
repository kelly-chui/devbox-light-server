import express from "express";
import dbRouter from "./routes/db";
import systemRouter from "./routes/system";

const app = express();

app.use(express.json());

app.use("/db", dbRouter);
app.use("/system", systemRouter);

export default app;
