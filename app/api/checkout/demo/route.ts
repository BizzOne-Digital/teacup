import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";

/** Marks order as paid when Stripe is not configured (local / demo). */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "paid", paidAt: new Date() },
      { new: true }
    );
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
