"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { BottomSheet } from "@/components/primitives/bottom-sheet/BottomSheet";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { Badge } from "@/components/primitives/badge/Badge";
import { cn } from "@/lib/cn";
import { useCart, type CartModifier } from "./CartProvider";
import type { MenuItem, ModifierGroup, ModifierOption } from "@juntai/types";

// ── Price helpers ─────────────────────────────────────────────────────────────

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ── Selection state types ─────────────────────────────────────────────────────

type SelectionMap = Record<string, Set<string>>; // groupId → Set<optionId>

function initialSelection(groups: ModifierGroup[]): SelectionMap {
  return Object.fromEntries(groups.map((g) => [g.id, new Set<string>()]));
}

// ── Option price delta badge ──────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return null;
  return (
    <Text variant="xs" muted className="shrink-0">
      {delta > 0 ? "+" : ""}
      {fmtPrice(delta)}
    </Text>
  );
}

// ── Modifier group (single or multiple) ───────────────────────────────────────

function ModifierGroupSection({
  group,
  selection,
  onToggle,
}: {
  group: ModifierGroup;
  selection: Set<string>;
  onToggle: (groupId: string, optionId: string) => void;
}) {
  const isSingle = group.selectionType === "SINGLE";

  return (
    <div className="px-5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Text variant="sm" className="font-semibold">
          {group.name}
        </Text>
        {group.isRequired && (
          <Badge variant="warning" className="text-xs">
            Obrigatório
          </Badge>
        )}
        {!isSingle && group.maxSelections && (
          <Text variant="xs" muted className="ml-auto">
            Máx. {group.maxSelections}
          </Text>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {group.options.map((option) => {
          const selected = selection.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(group.id, option.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border-strong bg-surface",
              )}
            >
              {/* Radio/Checkbox indicator */}
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center",
                  isSingle ? "rounded-full border-2" : "rounded border-2",
                  selected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40",
                )}
              >
                {selected && (
                  <span
                    className={cn(
                      "block bg-primary-foreground",
                      isSingle ? "size-1.5 rounded-full" : "size-2 rounded-sm",
                    )}
                  />
                )}
              </span>
              <Text variant="sm" className="flex-1">
                {option.name}
              </Text>
              <DeltaBadge delta={option.priceDelta} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Quantity selector ─────────────────────────────────────────────────────────

function QuantitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-8 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
      >
        <Minus size={14} />
      </button>
      <Text variant="sm" className="w-4 text-center font-semibold tabular-nums">
        {value}
      </Text>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex size-8 items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface ModifierSheetProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

export function ModifierSheet({ item, open, onClose }: ModifierSheetProps) {
  const { addItem } = useCart();
  const [selection, setSelection] = React.useState<SelectionMap>({});
  const [quantity, setQuantity] = React.useState(1);

  // Reset state when item changes
  React.useEffect(() => {
    if (item) {
      setSelection(initialSelection(item.modifierGroups));
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  const handleToggle = (groupId: string, optionId: string) => {
    const group = item.modifierGroups.find((g) => g.id === groupId);
    if (!group) return;

    setSelection((prev) => {
      const current = new Set(prev[groupId]);
      if (group.selectionType === "SINGLE") {
        // Radio: deselect others
        current.clear();
        if (!prev[groupId].has(optionId)) current.add(optionId);
      } else {
        // Checkbox: toggle
        if (current.has(optionId)) {
          current.delete(optionId);
        } else {
          const max = group.maxSelections;
          if (!max || current.size < max) current.add(optionId);
        }
      }
      return { ...prev, [groupId]: current };
    });
  };

  // Validate required groups
  const requiredGroups = item.modifierGroups.filter((g) => g.isRequired);
  const allRequiredSatisfied = requiredGroups.every(
    (g) => (selection[g.id]?.size ?? 0) > 0,
  );

  // Build selected modifiers list + compute final price
  const selectedModifiers: CartModifier[] = [];
  let priceDelta = 0;

  for (const group of item.modifierGroups) {
    const selectedIds = selection[group.id] ?? new Set();
    for (const optionId of selectedIds) {
      const option = findOption(group.options, optionId);
      if (option) {
        selectedModifiers.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          priceDelta: option.priceDelta,
        });
        priceDelta += option.priceDelta;
      }
    }
  }

  const finalPrice = item.basePrice + priceDelta;
  const totalPrice = finalPrice * quantity;

  const handleAdd = () => {
    if (!allRequiredSatisfied) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.basePrice,
      finalPrice,
      quantity,
      notes: "",
      selectedModifiers,
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={item.name}>
      {/* Item image */}
      {item.imageUrl && (
        <div className="h-40 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Description */}
      {item.description && (
        <div className="px-5 py-3 border-b border-border">
          <Text variant="sm" muted>
            {item.description}
          </Text>
        </div>
      )}

      {/* Modifier groups */}
      {item.modifierGroups.map((group, i) => (
        <React.Fragment key={group.id}>
          {i > 0 && <div className="border-t border-border" />}
          <ModifierGroupSection
            group={group}
            selection={selection[group.id] ?? new Set()}
            onToggle={handleToggle}
          />
        </React.Fragment>
      ))}

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border bg-background px-5 py-4 flex items-center gap-4">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <Button
          onClick={handleAdd}
          disabled={!allRequiredSatisfied}
          className="flex-1"
        >
          Adicionar · {fmtPrice(totalPrice)}
        </Button>
      </div>
    </BottomSheet>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function findOption(
  options: ModifierOption[],
  optionId: string,
): ModifierOption | undefined {
  for (const option of options) {
    if (option.id === optionId) return option;
    if (option.childOptions) {
      const found = findOption(option.childOptions, optionId);
      if (found) return found;
    }
  }
  return undefined;
}
