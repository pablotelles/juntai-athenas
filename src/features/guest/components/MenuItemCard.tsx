"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { cn } from "@/lib/cn";
import { useCart } from "./CartProvider";
import type { MenuItem } from "@juntai/types";

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export interface MenuItemCardProps {
  item: MenuItem;
  onOpenModifiers: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onOpenModifiers }: MenuItemCardProps) {
  const { addItem, items, updateQuantity } = useCart();

  const hasRequiredModifiers = item.modifierGroups.some((g) => g.isRequired);
  const hasModifiers = item.modifierGroups.length > 0;

  // All cart entries for this item (may differ by modifier selection)
  const cartEntries = items.filter((i) => i.menuItemId === item.id);
  const cartQty = cartEntries.reduce((acc, i) => acc + i.quantity, 0);
  // For simple items there is always at most one entry
  const simpleEntry = !hasModifiers ? cartEntries[0] : undefined;

  const handleAdd = () => {
    if (hasRequiredModifiers || hasModifiers) {
      onOpenModifiers(item);
      return;
    }
    if (simpleEntry) {
      updateQuantity(simpleEntry.cartId, simpleEntry.quantity + 1);
    } else {
      addItem({
        menuItemId: item.id,
        name: item.name,
        basePrice: item.basePrice,
        finalPrice: item.basePrice,
        quantity: 1,
        notes: "",
        selectedModifiers: [],
      });
    }
  };

  const handleDecrement = () => {
    if (!simpleEntry) return;
    updateQuantity(simpleEntry.cartId, simpleEntry.quantity - 1);
  };

  if (!item.isAvailable) return null;

  const showInlineCounter = !hasModifiers && cartQty > 0;
  const showModifierBadge = hasModifiers && cartQty > 0;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
      {/* Item image */}
      {item.imageUrl && (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <Text variant="sm" className="font-semibold leading-snug">
          {item.name}
        </Text>
        {item.description && (
          <Text variant="xs" muted className="line-clamp-2 leading-snug">
            {item.description}
          </Text>
        )}
        <Text variant="sm" className="mt-1 font-semibold text-primary">
          {fmtPrice(item.basePrice)}
          {item.modifierGroups.some((g) =>
            g.options.some((o) => o.priceDelta > 0),
          ) && (
            <span className="font-normal text-muted-foreground text-xs ml-1">
              +opções
            </span>
          )}
        </Text>
      </div>

      {/* Quantity controls / Add button */}
      <div className="shrink-0 flex items-center self-center">
        {showInlineCounter ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Remover um"
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                "border border-primary text-primary",
                "hover:bg-primary/10 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <Minus size={14} />
            </button>
            <Text
              variant="sm"
              className="w-6 text-center font-bold tabular-nums"
            >
              {cartQty}
            </Text>
            <button
              type="button"
              onClick={handleAdd}
              aria-label="Adicionar mais um"
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground",
                "hover:bg-primary-hover transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Adicionar ${item.name}`}
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground",
                "hover:bg-primary-hover transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <Plus size={16} />
            </button>
            {showModifierBadge && (
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary ring-2 ring-surface">
                <span className="text-[10px] font-bold leading-none text-primary-foreground">
                  {cartQty > 9 ? "9+" : cartQty}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
