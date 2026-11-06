import { Router } from "express";
import {
  advanceOrder,
  cancelOrder,
  createOrder,
  getOrder,
  listOrders,
} from "../services/orders.service";
import { openStream } from "../sse/stream";
import { parseId, parseNewOrder } from "../validation/orders.validation";

export const ordersRouter = Router();

ordersRouter.get("/orders", async (_req, res) => {
  res.json(await listOrders());
});

ordersRouter.get("/orders/:id", async (req, res) => {
  res.json(await getOrder(parseId(req.params.id)));
});

ordersRouter.post("/orders", async (req, res) => {
  const order = await createOrder(parseNewOrder(req.body));
  res.status(201).location(`/orders/${order.id}`).json(order);
});

ordersRouter.post("/orders/:id/advance", async (req, res) => {
  res.json(await advanceOrder(parseId(req.params.id)));
});

ordersRouter.post("/orders/:id/cancel", async (req, res) => {
  res.json(await cancelOrder(parseId(req.params.id)));
});

ordersRouter.get("/orders/:id/events", async (req, res) => {
  const id = parseId(req.params.id);
  const order = await getOrder(id);
  openStream(
    req,
    res,
    (event) => event.name !== "stock:updated" && event.data.id === id,
    { name: "order:status", data: order },
  );
});
