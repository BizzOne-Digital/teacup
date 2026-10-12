import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import {
  buildStripeOrderMetadata,
  getAppBaseUrl,
  getStripe,
  STORE_NAME,
} from "@/lib/stripe";
import { TAX_RATE } from "@/lib/order-utils";
import type { OrderItem } from "@/lib/types";

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
    const baseUrl = getAppBaseUrl();

    if (!stripe) {
      return NextResponse.json({
        demo: true,
        orderId: order._id.toString(),
        message: "Stripe not configured — use demo payment",
      });
    }

    const taxPercent = Math.round(TAX_RATE * 100);
    const stripeMetadata = buildStripeOrderMetadata(order, baseUrl);

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
              description: order.items
                .map((i: OrderItem) => `${i.quantity}× ${i.name}`)
                .slice(0, 5)
                .join(", "),
            },
            unit_amount: Math.round(order.subtotal * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Tax (${taxPercent}%)`,
            },
            unit_amount: Math.round(order.tax * 100),
          },
          quantity: 1,
        },
      ],
      metadata: stripeMetadata,
      payment_intent_data: {
        description: `${STORE_NAME} · ${order.orderNumber}`,
        statement_descriptor_suffix: "TEA CUP CAFE",
        metadata: stripeMetadata,
      },
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    if (!session.url) {
      return NextResponse.json({ error: "Stripe session missing URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
