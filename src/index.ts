import express from "express";
import path from "node:path";
import { PORT } from "./config/config";
import { initDb } from "./db/database";
import { errorHandler } from "./middlewares/error-handler";
import { resumeDeliveries } from "./services/orders.service";
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
