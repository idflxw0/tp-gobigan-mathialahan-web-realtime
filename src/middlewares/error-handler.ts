import type { ErrorRequestHandler } from "express";
import { ConflictError, NotFoundError, ValidationError } from "../errors/app-errors";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ValidationError || error instanceof SyntaxError) {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }
  if (error instanceof ConflictError) {
    res.status(409).json({ error: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
};
