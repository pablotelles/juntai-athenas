"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { cn } from "@/lib/cn";
import { useCart } from "./CartProvider";

export interface CartButtonProps {
  onOpen: () => void;
  /** When true, positions the button absolute (stays within its container). */
  contained?: boolean;
}

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CartButton({ onOpen, contained = false }: CartButtonProps) {
  const { itemCount, totalCents } = useCart();

  if (itemCount === 0) return null;

  return (
    <div
      className={cn(
        "z-20 flex",
        contained
          ? "absolute bottom-4 left-3 right-3"
          : "fixed bottom-6 left-4 right-4",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 items-center gap-3 rounded-2xl bg-primary px-4 py-3 shadow-lg hover:bg-primary-hover transition-colors active:scale-[0.98]"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/20 shrink-0">
          <Text
            variant="xs"
            className="font-bold text-primary-foreground tabular-nums"
          >
            {itemCount}
          </Text>
        </span>

        <Text
          variant="sm"
          className="font-semibold text-primary-foreground flex-1 text-center"
        >
          Ver carrinho
        </Text>

        <Text
          variant="sm"
          className="font-semibold text-primary-foreground shrink-0"
        >
          {fmtPrice(totalCents)}
        </Text>

        <ShoppingCart
          size={18}
          className="text-primary-foreground/80 shrink-0"
        />
      </button>
    </div>
  );
}
