/**
 * Validates Tea Cup Cafe Stripe metadata rules and creates a throwaway Checkout Session.
 * Run: node scripts/test-stripe-metadata.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const STORE_NAME = "Tea Cup Cafe";
const STORE_SOURCE = "teacup-store";

function buildStripeOrderMetadata(order, baseUrl) {
  const meta = {
    site: STORE_NAME,
    store: STORE_NAME,
    source: STORE_SOURCE,
    orderId: order._id,
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

function validateMetadata(meta, label) {
  const errors = [];
  const keys = Object.keys(meta);
  if (keys.length > 50) errors.push(`${label}: more than 50 keys`);
  for (const [k, v] of Object.entries(meta)) {
    if (k.length > 40) errors.push(`${label}: key too long: ${k}`);
    if (typeof v !== "string") errors.push(`${label}: ${k} is not a string`);
    else if (v.length > 500) errors.push(`${label}: ${k} value > 500 chars`);
    if (v === "") errors.push(`${label}: ${k} is empty`);
  }
  return errors;
}

function metadataMatches(expected, actual, label) {
  const errors = [];
  for (const [k, v] of Object.entries(expected)) {
    if (actual[k] !== v) {
      errors.push(`${label}: mismatch on ${k} (expected "${v}", got "${actual[k] ?? ""}")`);
    }
  }
  return errors;
}

loadEnvLocal();

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("STRIPE_SECRET_KEY not set — cannot call Stripe API.");
  process.exit(1);
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
const fakeOrder = {
  _id: "507f1f77bcf86cd799439011",
  orderNumber: "TC-META-TEST",
  customer: {
    name: "Metadata Test",
    email: "metadata-test@teacupcafe.com",
    phone: "+19164486212",
    notes: "Stripe metadata verification run",
  },
};

const stripeMetadata = buildStripeOrderMetadata(fakeOrder, baseUrl);
const localErrors = validateMetadata(stripeMetadata, "local");
if (localErrors.length) {
  console.error("Local validation failed:\n", localErrors.join("\n"));
  process.exit(1);
}

console.log("Local metadata validation: OK");
console.log("Keys:", Object.keys(stripeMetadata).join(", "));

const stripe = new Stripe(key);
const suffix = "TEA CUP CAFE";
const description = `${STORE_NAME} · ${fakeOrder.orderNumber}`;

let session;
try {
  session = await stripe.checkout.sessions.create({
    mode: "payment",
    allowed_payment_method_types: ["card"],
    customer_email: fakeOrder.customer.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Metadata test (do not pay)" },
          unit_amount: 50,
        },
        quantity: 1,
      },
    ],
    metadata: stripeMetadata,
    payment_intent_data: {
      description,
      statement_descriptor_suffix: suffix,
      metadata: stripeMetadata,
    },
    success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/?checkout=cancelled`,
  });
} catch (e) {
  console.error("Stripe checkout.sessions.create FAILED:");
  console.error(e.message || e);
  if (e.raw?.message) console.error("Stripe:", e.raw.message);
  process.exit(1);
}

console.log("Checkout session created:", session.id);
console.log("(Unpaid test session — safe to ignore in Dashboard)\n");

const expanded = await stripe.checkout.sessions.retrieve(session.id, {
  expand: ["payment_intent"],
});

const sessionMeta = expanded.metadata || {};
const errors = metadataMatches(stripeMetadata, sessionMeta, "session.metadata");

const piRef = expanded.payment_intent;
if (piRef && typeof piRef === "object" && piRef.id) {
  const piMeta = piRef.metadata || {};
  errors.push(...metadataMatches(stripeMetadata, piMeta, "payment_intent.metadata"));
  if (piRef.description !== description) {
    errors.push(
      `payment_intent.description mismatch (got "${piRef.description}")`
    );
  }
} else {
  console.log(
    "PaymentIntent: not created yet (normal for open Checkout — metadata is set via payment_intent_data when the customer pays)."
  );
}

if (errors.length) {
  console.error("Metadata verification FAILED:\n", errors.join("\n"));
  try {
    await stripe.checkout.sessions.expire(session.id);
  } catch {
    /* ignore */
  }
  process.exit(1);
}

console.log("Session metadata.site:", sessionMeta.site);
console.log("Session metadata.store:", sessionMeta.store);
console.log("Session metadata.source:", sessionMeta.source);
console.log("Session metadata.orderNumber:", sessionMeta.orderNumber);

try {
  await stripe.checkout.sessions.expire(session.id);
  console.log("Test session expired (removed from open checkouts).");
} catch {
  console.log("Could not expire test session — you may delete it manually in Stripe.");
}

console.log("\nAll metadata checks passed.");
