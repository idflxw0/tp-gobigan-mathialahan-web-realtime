import { DELIVERY_DELAY_MS } from "./config";
import { getOrders, getProducts, getUsers, saveOrders, saveProducts } from "./db";
import type { Status } from "./enums";
import { ConflictError, NotFoundError } from "./errors";
import { publish } from "./events";
import { withLock } from "./lock";
import type { Order, Product } from "./types";
import type { NewOrderInput } from "./validation";

const NEXT_STATUS: Record<Status, Status | null> = {
  preparing: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
};

export async function listOrders(): Promise<Order[]> {
  return getOrders();
}

export async function getOrder(id: number): Promise<Order> {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) throw new NotFoundError(`Order ${id} not found`);
  return order;
}

async function changeStock(productId: number, delta: number): Promise<Product> {
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) throw new NotFoundError(`Product ${productId} not found`);
  const updated: Product = { ...product, stock: product.stock + delta };
  await saveProducts(products.map((p) => (p.id === productId ? updated : p)));
  publish({ name: "stock:updated", data: updated });
  return updated;
}

async function replaceOrder(updated: Order): Promise<void> {
  const orders = await getOrders();
  await saveOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
}

function scheduleDelivery(orderId: number): void {
  setTimeout(() => {
    deliver(orderId).catch((error: unknown) => {
      console.error(`Automatic delivery of order ${orderId} failed`, error);
    });
  }, DELIVERY_DELAY_MS);
}

async function deliver(orderId: number): Promise<void> {
  await withLock(async () => {
    const order = await getOrder(orderId);
    if (order.status !== "shipped") return;
    const updated: Order = { ...order, status: "delivered" };
    await replaceOrder(updated);
    publish({ name: "order:status", data: updated });
  });
}

export function createOrder(input: NewOrderInput): Promise<Order> {
  return withLock(async () => {
    const users = await getUsers();
    if (!users.some((u) => u.id === input.userId)) {
      throw new NotFoundError(`User ${input.userId} not found`);
    }
    const products = await getProducts();
    const product = products.find((p) => p.id === input.productId);
    if (!product) throw new NotFoundError(`Product ${input.productId} not found`);
    if (product.stock < input.quantity) {
      throw new ConflictError(
        `Insufficient stock: ${product.stock} available, ${input.quantity} requested`,
      );
    }

    await changeStock(product.id, -input.quantity);

    const orders = await getOrders();
    const order: Order = {
      id: orders.reduce((max, o) => Math.max(max, o.id), 0) + 1,
      userId: input.userId,
      productId: input.productId,
      quantity: input.quantity,
      status: "preparing",
      createdAt: new Date().toISOString(),
    };
    await saveOrders([...orders, order]);
    publish({ name: "order:created", data: order });
    return order;
  });
}

export function advanceOrder(id: number): Promise<Order> {
  return withLock(async () => {
    const order = await getOrder(id);
    const next = NEXT_STATUS[order.status];
    if (next === null) {
      throw new ConflictError(`Order ${id} is ${order.status} and cannot advance`);
    }
    const updated: Order = { ...order, status: next };
    await replaceOrder(updated);
    publish({ name: "order:status", data: updated });
    if (next === "shipped") scheduleDelivery(id);
    return updated;
  });
}

export function cancelOrder(id: number): Promise<Order> {
  return withLock(async () => {
    const order = await getOrder(id);
    if (order.status !== "preparing") {
      throw new ConflictError(`Order ${id} is ${order.status} and cannot be cancelled`);
    }
    const updated: Order = { ...order, status: "cancelled" };
    await replaceOrder(updated);
    await changeStock(order.productId, order.quantity);
    publish({ name: "order:cancelled", data: updated });
    return updated;
  });
}

export async function resumeDeliveries(): Promise<void> {
  const orders = await getOrders();
  for (const order of orders) {
    if (order.status === "shipped") scheduleDelivery(order.id);
  }
}
