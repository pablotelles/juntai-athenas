"use client";

import * as React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  /** Local unique ID (for React keys + removal). */
  cartId: string;
  menuItemId: string;
  name: string;
  /** Base price in centavos. */
  basePrice: number;
  /** Final price (basePrice + sum of modifier priceDelta) in centavos. */
  finalPrice: number;
  quantity: number;
  notes: string;
  selectedModifiers: CartModifier[];
}

export interface CartState {
  items: CartItem[];
  totalCents: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, "cartId">) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clear: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const CartContext = React.createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const totalCents = items.reduce(
    (acc, item) => acc + item.finalPrice * item.quantity,
    0,
  );
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addItem = React.useCallback((item: Omit<CartItem, "cartId">) => {
    const cartId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    setItems((prev) => [...prev, { ...item, cartId }]);
  }, []);

  const removeItem = React.useCallback((cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const updateQuantity = React.useCallback(
    (cartId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.cartId !== cartId));
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i)),
      );
    },
    [],
  );

  const clear = React.useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCents,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
