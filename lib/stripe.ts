import Stripe from "stripe";

/** Shown in Stripe Dashboard metadata so payments are identifiable by site. */
export const STORE_NAME = "Tea Cup Cafe";
export const STORE_SOURCE = "teacup-store";

type OrderForStripeMeta = {
  _id: { toString(): string };
  orderNumber: string;
  customer: { name: string; email: string; phone: string; notes?: string };
};

export function buildStripeOrderMetadata(
  order: OrderForStripeMeta,
  baseUrl: string
): Record<string, string> {
  const meta: Record<string, string> = {
    site: STORE_NAME,
    store: STORE_NAME,
    source: STORE_SOURCE,
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    customerPhone: order.customer.phone,
    website: baseUrl,
  };
  if (order.customer.notes?.trim()) {
    meta.orderNotes = order.customer.notes.trim().slice(0, 500);
  }
  return meta;
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}
