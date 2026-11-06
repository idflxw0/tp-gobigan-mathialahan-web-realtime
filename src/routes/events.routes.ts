import { Router } from "express";
import { openStream } from "../sse/stream";

export const eventsRouter = Router();

eventsRouter.get("/events", (req, res) => {
  openStream(req, res, () => true);
});
