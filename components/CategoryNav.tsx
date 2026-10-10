"use client";

import type { MenuCategory } from "@/lib/types";

type Props = {
  categories: MenuCategory[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function CategoryNav({ categories, activeId, onSelect }: Props) {
  return (
    <div className="sticky top-0 z-30 w-full overflow-hidden border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4">
        <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
          {categories.map((cat) => {
            const active = cat.id === activeId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[#2d422b] text-white shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
