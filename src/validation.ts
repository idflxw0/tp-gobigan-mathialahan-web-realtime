import { ValidationError } from "./errors";

export type NewOrderInput = {
  userId: number;
  productId: number;
  quantity: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toPositiveInteger(value: unknown, field: string): number {
  if (value === undefined || value === null) {
    throw new ValidationError(`Field "${field}" is required`);
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`Field "${field}" must be a positive integer`);
  }
  return value;
}

export function parseNewOrder(body: unknown): NewOrderInput {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be a JSON object");
  }
  return {
    userId: toPositiveInteger(body.userId, "userId"),
    productId: toPositiveInteger(body.productId, "productId"),
    quantity: toPositiveInteger(body.quantity, "quantity"),
  };
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("Id must be a positive integer");
  }
  return id;
}
