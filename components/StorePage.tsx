"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [dismissedSuccess, setDismissedSuccess] = useState(false);
  const [paidToast, setPaidToast] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemCount = useCart((s) => s.itemCount());
  const clearCart = useCart((s) => s.clear);

  const checkoutSuccess = searchParams.get("checkout") === "success";
  const orderFromQuery = searchParams.get("order");
  const successMessage =
    checkoutSuccess && !dismissedSuccess
      ? orderFromQuery
        ? `Thank you! Order ${orderFromQuery} is confirmed.`
        : "Thank you! Your order is confirmed."
      : null;

  const activeCategory = useMemo(
    () =>
      menu.categories.find((c) => c.id === activeCategoryId) ??
      menu.categories[0],
    [menu.categories, activeCategoryId]
  );

  useEffect(() => {
    if (!checkoutSuccess) return;
    clearCart();
    router.replace("/", { scroll: false });
  }, [checkoutSuccess, clearCart, router]);

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
          setPaidToast(`Thank you! Order ${orderNumber} is paid.`)
        }
      />
      {(successMessage || paidToast) ? (
        <div
          className="fixed left-3 right-3 top-4 z-50 mx-auto max-w-md rounded-2xl bg-[#2d422b] px-4 py-3 text-center text-sm text-white shadow-lg sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-full sm:px-6"
          role="status"
        >
          {successMessage ?? paidToast}
          <button
            type="button"
            className="ml-3 opacity-80"
            onClick={() => {
              setDismissedSuccess(true);
              setPaidToast(null);
            }}
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
