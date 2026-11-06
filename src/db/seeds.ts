import type { Product, User } from "../types/models";

export const SEED_USERS: User[] = [
  { id: 1, name: "Alice Martin", username: "alice", email: "alice@example.com" },
  { id: 2, name: "Bob Durand", username: "bob", email: "bob@example.com" },
];

export const SEED_PRODUCTS: Product[] = [
  { id: 1, name: "Keyboard", stock: 10 },
  { id: 2, name: "Mouse", stock: 15 },
  { id: 3, name: "Monitor", stock: 5 },
];
