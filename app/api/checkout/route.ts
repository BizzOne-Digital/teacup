import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!stripe) {
      return NextResponse.json({
        demo: true,
        orderId: order._id.toString(),
        message: "Stripe not configured — use demo payment",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allowed_payment_method_types: ["card"],
      customer_email: order.customer.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Tea Cup Cafe — Order ${order.orderNumber}`,
              description: `${order.items.length} item(s)`,
            },
            unit_amount: Math.round(order.total * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
      success_url: `${baseUrl}/?checkout=success&order=${order.orderNumber}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
