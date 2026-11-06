import type { Request, Response } from "express";
import { subscribe } from "../events/event-bus";
import type { ShopEvent } from "../events/event-bus";

const subscribers = new Set<Response>();

function format(event: ShopEvent): string {
  return `event: ${event.name}\ndata: ${JSON.stringify(event.data)}\n\n`;
}

export function openStream(
  req: Request,
  res: Response,
  accepts: (event: ShopEvent) => boolean,
  initial?: ShopEvent,
): void {
  res.status(200).set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  if (initial) res.write(format(initial));

  const unsubscribe = subscribe((event) => {
    if (accepts(event)) res.write(format(event));
  });

  subscribers.add(res);
  console.log(`SSE subscriber connected (${subscribers.size} active)`);

  req.on("close", () => {
    unsubscribe();
    subscribers.delete(res);
    console.log(`SSE subscriber disconnected (${subscribers.size} active)`);
  });
}
