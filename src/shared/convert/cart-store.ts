import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartLine {
  id: string;
  name: string;
  price: number; // cents
  qty: number;
  /** Optional per-line free text (e.g. "sin cebolla"). */
  note?: string;
}

interface CartState {
  lines: CartLine[];
  notes: string;
  /** Optional preferred pickup/delivery time label, e.g. "21:30". */
  schedule: string;
  add: (item: { id: string; name: string; price: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setNotes: (notes: string) => void;
  /** Set a per-line note. */
  setLineNote: (id: string, note: string) => void;
  /** Set the preferred time slot. */
  setSchedule: (schedule: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number; // cents
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      notes: "",
      schedule: "",
      add: (item) =>
        set((s) => {
          const existing = s.lines.find((l) => l.id === item.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.id === item.id ? { ...l, qty: l.qty + 1 } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...item, qty: 1 }] };
        }),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.id !== id)
              : s.lines.map((l) => (l.id === id ? { ...l, qty } : l)),
        })),
      setNotes: (notes) => set({ notes }),
      setLineNote: (id, note) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.id === id ? { ...l, note } : l)),
        })),
      setSchedule: (schedule) => set({ schedule }),
      clear: () => set({ lines: [], notes: "", schedule: "" }),
      count: () => get().lines.reduce((s, l) => s + l.qty, 0),
      subtotal: () => get().lines.reduce((s, l) => s + l.qty * l.price, 0),
    }),
    {
      name: "sear_cart",
      storage: createJSONStorage(() => sessionStorage),
      version: 2,
    },
  ),
);
