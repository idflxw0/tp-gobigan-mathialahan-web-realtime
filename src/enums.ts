export type Status = "preparing" | "shipped" | "delivered" | "cancelled";

export type ShopEventName =
  | "order:created"
  | "order:status"
  | "order:cancelled"
  | "stock:updated";
