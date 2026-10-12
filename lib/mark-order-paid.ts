import { connectDB } from "./mongodb";
import { Order } from "./models/Order";

export async function markOrderPaid(
  orderId: string,
  stripeSessionId?: string
) {
  await connectDB();
  const update: Record<string, unknown> = {
    status: "paid",
    paidAt: new Date(),
  };
  if (stripeSessionId) update.stripeSessionId = stripeSessionId;

  return Order.findByIdAndUpdate(orderId, update, { new: true });
}
