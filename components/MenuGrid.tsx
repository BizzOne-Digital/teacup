"use client";

import type { MenuCategory } from "@/lib/types";
import { useCart } from "@/store/cart";
import { MenuItemImage } from "./MenuItemImage";

type Props = {
  category: MenuCategory;
};

export function MenuGrid({ category }: Props) {
  const addItem = useCart((s) => s.addItem);

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl px-3 py-8 sm:px-4 sm:py-10" id="menu">
      <div className="mb-6 flex min-w-0 items-end justify-between gap-4 sm:mb-8">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-snug text-[#2d422b] sm:text-2xl md:text-3xl">
            {category.name}
          </h2>
          <p className="mt-1 text-stone-600">
            {category.items.length} items · prices in USD
          </p>
        </div>
      </div>
      <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {category.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3] bg-stone-100">
              <MenuItemImage
                src={item.image}
                alt={item.name}
                categoryFallback={category.image}
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-semibold text-stone-900 line-clamp-2">
                {item.name}
              </h3>
              {item.description ? (
                <p className="mt-1 flex-1 text-sm text-stone-600 line-clamp-2">
                  {item.description}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-base font-semibold text-[#2d422b] sm:text-lg">
                  ${item.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      itemId: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                    })
                  }
                  className="shrink-0 rounded-full bg-[#2d422b] px-3 py-2 text-xs font-medium text-white hover:bg-[#3d5c38] sm:px-4 sm:text-sm"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
