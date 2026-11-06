import { Router } from "express";
import { getProducts, getUsers } from "./db";
import { advanceOrder, cancelOrder, createOrder, getOrder, listOrders } from "./orders";
import { openStream } from "./sse";
import { parseId, parseNewOrder } from "./validation";

export const router = Router();

router.get("/users", async (_req, res) => {
  res.json(await getUsers());
});

router.get("/products", async (_req, res) => {
  res.json(await getProducts());
});

router.get("/orders", async (_req, res) => {
  res.json(await listOrders());
});

router.get("/orders/:id", async (req, res) => {
  res.json(await getOrder(parseId(req.params.id)));
});

router.post("/orders", async (req, res) => {
  const order = await createOrder(parseNewOrder(req.body));
  res.status(201).location(`/orders/${order.id}`).json(order);
});

router.post("/orders/:id/advance", async (req, res) => {
  res.json(await advanceOrder(parseId(req.params.id)));
});

router.post("/orders/:id/cancel", async (req, res) => {
  res.json(await cancelOrder(parseId(req.params.id)));
});

router.get("/events", (req, res) => {
  openStream(req, res, () => true);
});

router.get("/orders/:id/events", async (req, res) => {
  const id = parseId(req.params.id);
  const order = await getOrder(id);
  openStream(
    req,
    res,
    (event) => event.name !== "stock:updated" && event.data.id === id,
    { name: "order:status", data: order },
  );
});
