"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

type CartState = {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">) => void;
  removeItem: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
  itemCount: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (line) => {
        set((state) => {
          const existing = state.lines.find((l) => l.itemId === line.itemId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.itemId === line.itemId
                  ? { ...l, quantity: l.quantity + 1 }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: 1 }] };
        });
      },
      removeItem: (itemId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.itemId !== itemId),
        })),
      setQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) =>
            l.itemId === itemId ? { ...l, quantity } : l
          ),
        }));
      },
      clear: () => set({ lines: [] }),
      itemCount: () =>
        get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    }),
    { name: "teacup-cart" }
  )
);
