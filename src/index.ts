import express from "express";
import path from "node:path";
import { PORT } from "./config";
import { initDb } from "./db";
import { errorHandler } from "./errorHandler";
import { resumeDeliveries } from "./orders";
import { router } from "./routes";

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(router);
app.use(errorHandler);

async function start(): Promise<void> {
  await initDb();
  await resumeDeliveries();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
