import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");
  const status = searchParams.get("status");

  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (since) {
      filter.paidAt = { $gte: new Date(since) };
      filter.status = "paid";
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        subtotal: o.subtotal,
        tax: o.tax,
        total: o.total,
        customer: o.customer,
        items: o.items,
        paidAt: o.paidAt,
        createdAt: o.createdAt,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
