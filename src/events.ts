import { EventEmitter } from "node:events";
import type { Order, Product } from "./types";

export type ShopEvent =
  | { name: "order:created"; data: Order }
  | { name: "order:status"; data: Order }
  | { name: "order:cancelled"; data: Order }
  | { name: "stock:updated"; data: Product };

const emitter = new EventEmitter();

export function publish(event: ShopEvent): void {
  emitter.emit("event", event);
}

export function subscribe(listener: (event: ShopEvent) => void): () => void {
  emitter.on("event", listener);
  return () => {
    emitter.off("event", listener);
  };
}
