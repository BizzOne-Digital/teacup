"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/store/cart";
import { calcTotals, TAX_RATE } from "@/lib/order-utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
};

export function CheckoutModal({ open, onClose, onSuccess }: Props) {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => calcTotals(lines), [lines]);
  const taxLabel = `${Math.round(TAX_RATE * 100)}%`;

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const items = lines.map((l) => ({
        itemId: l.itemId,
        name: l.name,
        price: l.price,
        quantity: l.quantity,
      }));

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: { name, email, phone, notes },
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Order failed");

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.id }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || "Checkout failed");

      if (checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }

      if (checkoutData.demo) {
        const payRes = await fetch("/api/checkout/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.id }),
        });
        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(payData.error || "Demo payment failed");
        clear();
        onSuccess(payData.orderNumber);
        onClose();
        return;
      }

      throw new Error("Unexpected checkout response");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-4">
      <div
        className="mb-0 max-h-[min(90vh,100%)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:mb-auto sm:p-6"
        role="dialog"
        aria-labelledby="checkout-title"
      >
        <div className="flex items-center justify-between">
          <h2 id="checkout-title" className="text-xl font-semibold text-[#2d422b]">
            Your details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          Enter your contact info, then continue to secure card payment on Stripe.
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          />
          <input
            required
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Order notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            rows={2}
          />
          <div className="rounded-xl bg-stone-50 p-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between text-stone-600">
              <span>Tax ({taxLabel})</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold text-[#2d422b]">
              <span>Total due</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || lines.length === 0}
            className="w-full rounded-full bg-[#2d422b] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Pay now"}
          </button>
          <p className="text-center text-xs text-stone-500">
            You will be redirected to Stripe to enter card details. After payment
            you return here with a confirmation message.
          </p>
        </form>
      </div>
    </div>
  );
}
