import { Schema, models, model } from "mongoose";
import type { OrderItem, OrderStatus } from "../types";

export interface IOrder {
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  stripeSessionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        itemId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      notes: String,
    },
    stripeSessionId: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export const Order =
  models.Order<IOrder> || model<IOrder>("Order", OrderSchema);
