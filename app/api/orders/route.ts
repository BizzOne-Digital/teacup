import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { calcTotals, generateOrderNumber } from "@/lib/order-utils";
import type { CustomerInfo, OrderItem } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body.items as OrderItem[];
    const customer = body.customer as CustomerInfo;

    if (!items?.length || !customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Items and customer details are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const { subtotal, tax, total } = calcTotals(items);
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      items,
      subtotal,
      tax,
      total,
      status: "pending",
      customer,
    });

    return NextResponse.json({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      subtotal,
      tax,
      total,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
