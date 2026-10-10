/**
 * Seeds MongoDB: store menu snapshot + order indexes.
 * Run: npm run seed
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local — set MONGODB_URI first.");
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

loadEnvLocal();

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("USER:PASSWORD")) {
  console.error(
    "Set a real MONGODB_URI in .env.local before seeding."
  );
  process.exit(1);
}

const menuPath = path.join(root, "data", "menu.json");
const menu = JSON.parse(fs.readFileSync(menuPath, "utf8"));

const StoreMenuSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    storeName: String,
    categories: mongoose.Schema.Types.Mixed,
    itemCount: Number,
    categoryCount: Number,
    seededAt: { type: Date, default: Date.now },
  },
  { collection: "store_menus" }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: Array,
    subtotal: Number,
    tax: Number,
    total: Number,
    status: String,
    customer: Object,
    stripeSessionId: String,
    paidAt: Date,
  },
  { timestamps: true, collection: "orders" }
);

const itemCount = menu.categories.reduce((n, c) => n + c.items.length, 0);

await mongoose.connect(uri);
const StoreMenu =
  mongoose.models.StoreMenu || mongoose.model("StoreMenu", StoreMenuSchema);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

await StoreMenu.findOneAndUpdate(
  { key: "main" },
  {
    key: "main",
    storeName: menu.storeName,
    categories: menu.categories,
    itemCount,
    categoryCount: menu.categories.length,
    seededAt: new Date(),
  },
  { upsert: true, new: true }
);

await Order.syncIndexes();

console.log(
  `Seed OK — menu: ${menu.categories.length} categories, ${itemCount} items`
);
await mongoose.disconnect();
