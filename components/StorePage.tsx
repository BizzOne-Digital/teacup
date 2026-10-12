"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { MenuData } from "@/lib/types";
import { Hero } from "./Hero";
import { CategoryNav } from "./CategoryNav";
import { MenuGrid } from "./MenuGrid";
import { CartPanel } from "./CartPanel";
import { CheckoutModal } from "./CheckoutModal";
import { useCart } from "@/store/cart";
import { Logo } from "./Logo";
import { ContactSection } from "./ContactSection";

type Props = {
  menu: MenuData;
};

export function StorePage({ menu }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    menu.categories[0]?.id ?? ""
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemCount = useCart((s) => s.itemCount());
  const clearCart = useCart((s) => s.clear);
  const checkoutHandledRef = useRef(false);

  const activeCategory = useMemo(
    () =>
      menu.categories.find((c) => c.id === activeCategoryId) ??
      menu.categories[0],
    [menu.categories, activeCategoryId]
  );

  useEffect(() => {
    if (checkoutHandledRef.current) return;
    const checkout = searchParams.get("checkout");
    if (!checkout) return;

    checkoutHandledRef.current = true;

    if (checkout === "cancelled") {
      setBanner("Checkout cancelled. Your cart is still here — try again when ready.");
      router.replace("/", { scroll: false });
      return;
    }

    if (checkout !== "success") return;

    const sessionId = searchParams.get("session_id");

    (async () => {
      let message =
        "Thank you! Your payment was successful and your order is confirmed.";

      if (sessionId) {
        try {
          const res = await fetch("/api/checkout/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (res.ok && data.orderNumber) {
            message = `Thank you! Payment received. Order ${data.orderNumber} is confirmed.`;
          }
        } catch {
          /* keep generic message */
        }
      }

      clearCart();
      setBanner(message);
      router.replace("/", { scroll: false });
    })();
  }, [searchParams, clearCart, router]);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-stone-50 pb-52 sm:pb-48 md:pb-32">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-2 px-3 py-3 sm:left-4 sm:right-4 sm:top-4 sm:px-0 sm:py-0">
        <Logo variant="onDark" priority className="min-w-0 max-w-[58%] sm:max-w-none" />
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5 sm:gap-2">
        {itemCount > 0 ? (
          <a
            href="#cart"
            className="rounded-full bg-[#2d422b] px-3 py-1.5 text-xs font-medium text-white shadow-sm"
          >
            Cart ({itemCount})
          </a>
        ) : null}
        </div>
      </header>
      <Hero />
      <CategoryNav
        categories={menu.categories}
        activeId={activeCategory?.id ?? ""}
        onSelect={setActiveCategoryId}
      />
      {activeCategory ? <MenuGrid category={activeCategory} /> : null}
      <ContactSection />
      <CartPanel onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={(orderNumber) =>
          setBanner(
            `Thank you! Payment received. Order ${orderNumber} is confirmed.`
          )
        }
      />
      {banner ? (
        <div
          className="fixed left-3 right-3 top-4 z-50 mx-auto max-w-md rounded-2xl bg-[#2d422b] px-4 py-3 text-center text-sm text-white shadow-lg sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-full sm:px-6"
          role="status"
        >
          {banner}
          <button
            type="button"
            className="ml-3 opacity-80"
            onClick={() => setBanner(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
