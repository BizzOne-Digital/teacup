"use client";

import { useCart } from "@/store/cart";

type Props = {
  onCheckout: () => void;
};

export function CartPanel({ onCheckout }: Props) {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  const tax = Math.round(subtotal * 0.0875 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-40 box-border w-full max-w-full border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:left-auto md:right-4 md:bottom-4 md:w-[min(24rem,calc(100vw-2rem))] md:rounded-2xl md:border"
      id="cart"
    >
      <div className="max-h-[50vh] overflow-y-auto p-4 md:max-h-[70vh]">
        <h2 className="text-lg font-semibold text-[#2d422b]">Your cart</h2>
        {lines.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Cart is empty.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {lines.map((line) => (
              <li
                key={line.itemId}
                className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-3 last:border-0 sm:flex-nowrap sm:gap-3"
              >
                <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                  <p className="line-clamp-2 text-sm font-medium sm:truncate">
                    {line.name}
                  </p>
                  <p className="text-xs text-stone-500">
                    ${line.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-stone-100 text-stone-700"
                    onClick={() =>
                      setQuantity(line.itemId, line.quantity - 1)
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-stone-100 text-stone-700"
                    onClick={() =>
                      setQuantity(line.itemId, line.quantity + 1)
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => removeItem(line.itemId)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-stone-100 p-4">
        <div className="flex justify-between text-sm text-stone-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-stone-600">
          <span>Tax (8.75%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex justify-between font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={onCheckout}
          className="mt-4 w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-emerald-400"
        >
          Checkout
        </button>
      </div>
    </aside>
  );
}
