import type { Status } from "./enums";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type Product = {
  id: number;
  name: string;
  stock: number;
};

export type Order = {
  id: number;
  userId: User["id"]; 
  productId: Product["id"];
  quantity: number;
  status: Status;
  createdAt: string; 
};
