import { Router } from "express";
import { getProducts, getUsers } from "../db/database";

export const catalogRouter = Router();

catalogRouter.get("/users", async (_req, res) => {
  res.json(await getUsers());
});

catalogRouter.get("/products", async (_req, res) => {
  res.json(await getProducts());
});
