import path from "node:path";
import { Config, JsonDB } from "node-json-db";
import { SEED_PRODUCTS, SEED_USERS } from "./seeds";
import type { Order, Product, User } from "./types";

const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, "..", "data");

const db = new JsonDB(new Config(path.join(DATA_DIR, "shop"), true, true, "/"));

export async function initDb(): Promise<void> {
  if (!(await db.exists("/users"))) await db.push("/users", SEED_USERS);
  if (!(await db.exists("/products"))) await db.push("/products", SEED_PRODUCTS);
  if (!(await db.exists("/orders"))) await db.push("/orders", [] as Order[]);
}

export const getUsers = (): Promise<User[]> => db.getObjectDefault<User[]>("/users", []);

export const getProducts = (): Promise<Product[]> =>
  db.getObjectDefault<Product[]>("/products", []);

export const getOrders = (): Promise<Order[]> => db.getObjectDefault<Order[]>("/orders", []);

export const saveProducts = (products: Product[]): Promise<void> =>
  db.push("/products", products, true);

export const saveOrders = (orders: Order[]): Promise<void> =>
  db.push("/orders", orders, true);
