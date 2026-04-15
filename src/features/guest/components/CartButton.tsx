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

  const isEmpty = itemCount === 0;

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
        onClick={isEmpty ? undefined : onOpen}
        aria-label={isEmpty ? "Carrinho vazio" : `Ver carrinho — ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
        className={cn(
          "flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 shadow-lg transition-all active:scale-[0.98]",
          isEmpty
            ? "bg-secondary/80 cursor-default"
            : "bg-primary hover:bg-primary-hover cursor-pointer",
        )}
      >
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full shrink-0",
            isEmpty ? "bg-muted-foreground/20" : "bg-primary-foreground/20",
          )}
        >
          <Text
            variant="xs"
            className={cn(
              "font-bold tabular-nums",
              isEmpty ? "text-muted-foreground" : "text-primary-foreground",
            )}
          >
            {itemCount}
          </Text>
        </span>

        <Text
          variant="sm"
          className={cn(
            "font-semibold flex-1 text-center",
            isEmpty ? "text-muted-foreground" : "text-primary-foreground",
          )}
        >
          {isEmpty ? "Carrinho vazio" : "Ver carrinho"}
        </Text>

        {!isEmpty && (
          <Text
            variant="sm"
            className="font-semibold text-primary-foreground shrink-0"
          >
            {fmtPrice(totalCents)}
          </Text>
        )}

        <ShoppingCart
          size={18}
          className={cn(
            "shrink-0",
            isEmpty ? "text-muted-foreground/60" : "text-primary-foreground/80",
          )}
        />
      </button>
    </div>
  );
}
