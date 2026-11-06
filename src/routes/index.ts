import { Router } from "express";
import { catalogRouter } from "./catalog.routes";
import { eventsRouter } from "./events.routes";
import { ordersRouter } from "./orders.routes";

export const router = Router();

router.use(catalogRouter);
router.use(ordersRouter);
router.use(eventsRouter);
