import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/mark-order-paid";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";

/**
 * Called when the customer returns from Stripe Checkout.
 * Marks the order paid (idempotent) so admin sees status "paid" even before webhooks fire.
 */
export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    await connectDB();
    let order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "paid") {
      order = await markOrderPaid(orderId, session.id);
    }

    return NextResponse.json({
      ok: true,
      orderNumber: order?.orderNumber,
      status: "paid",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not confirm payment" }, { status: 500 });
  }
}
