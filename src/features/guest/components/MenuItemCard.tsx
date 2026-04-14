"use client";

import * as React from "react";
import { Plus } from "lucide-react";
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
  const { addItem } = useCart();

  const hasRequiredModifiers = item.modifierGroups.some((g) => g.isRequired);
  const hasModifiers = item.modifierGroups.length > 0;

  const handleAdd = () => {
    if (hasRequiredModifiers || hasModifiers) {
      onOpenModifiers(item);
      return;
    }
    // Simple item — add directly
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.basePrice,
      finalPrice: item.basePrice,
      quantity: 1,
      notes: "",
      selectedModifiers: [],
    });
  };

  if (!item.isAvailable) return null;

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
          <Text
            variant="xs"
            muted
            className="line-clamp-2 leading-snug"
          >
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

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        aria-label={`Adicionar ${item.name}`}
        className={cn(
          "shrink-0 flex size-8 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground",
          "hover:bg-primary-hover transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
