"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { BottomSheet } from "@/components/primitives/bottom-sheet/BottomSheet";
import { cn } from "@/lib/cn";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useStaffCreateOrder } from "@/features/tables/hooks";
import type { MenuWithCategories, MenuItem } from "@juntai/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ── types ─────────────────────────────────────────────────────────────────────

interface CartEntry {
  item: MenuItem;
  quantity: number;
  notes: string;
}

function itemNeedsConfiguration(item: MenuItem) {
  return item.modifierGroups.some(
    (group) =>
      group.isRequired ||
      group.minSelections > 0 ||
      group.stepType === "composition" ||
      group.stepType === "quantity",
  );
}

// ── sub-components ─────────────────────────────────────────────────────────────

function MenuItemRow({
  item,
  entry,
  onAdd,
  onRemove,
  onNotesChange,
}: {
  item: MenuItem;
  entry: CartEntry | undefined;
  onAdd: () => void;
  onRemove: () => void;
  onNotesChange: (notes: string) => void;
}) {
  const qty = entry?.quantity ?? 0;
  const requiresConfiguration = itemNeedsConfiguration(item);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <Text variant="body" className="font-medium truncate">
          {item.name}
        </Text>
        {item.description && (
          <Text variant="sm" muted className="line-clamp-1">
            {item.description}
          </Text>
        )}
        <Text variant="sm" className="text-primary font-semibold mt-0.5">
          {formatPrice(item.basePrice)}
        </Text>
        {requiresConfiguration && (
          <Text variant="xs" muted className="mt-1">
            Requer configuração de complementos antes do lançamento.
          </Text>
        )}
        {qty > 0 && (
          <input
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Observação (opcional)"
            value={entry?.notes ?? ""}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {qty > 0 ? (
          <>
            <button
              type="button"
              onClick={onRemove}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-5 text-center text-sm font-semibold tabular-nums">
              {qty}
            </span>
          </>
        ) : null}
        <button
          type="button"
          onClick={onAdd}
          disabled={requiresConfiguration}
          className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export interface StaffAddItemSheetProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  restaurantId: string;
}

export function StaffAddItemSheet({
  open,
  onClose,
  sessionId,
  restaurantId,
}: StaffAddItemSheetProps) {
  const { sessionToken } = useAuth();
  const createOrder = useStaffCreateOrder();

  const [cart, setCart] = React.useState<Map<string, CartEntry>>(new Map());
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const { data: menus = [], isLoading } = useQuery<MenuWithCategories[]>({
    queryKey: ["staff-menu", restaurantId, sessionId],
    queryFn: () =>
      apiClient(sessionToken).get<MenuWithCategories[]>(
        `/sessions/${sessionId}/menu`,
      ),
    enabled: open && !!sessionId && !!sessionToken,
    staleTime: 5 * 60_000,
  });

  // Flatten all categories across menus
  const allCategories = React.useMemo(
    () => menus.flatMap((m) => m.categories.filter((c) => c.isActive)),
    [menus],
  );

  // Set first active category when menus load
  React.useEffect(() => {
    if (!activeCategory && allCategories.length > 0) {
      setActiveCategory(allCategories[0].id);
    }
  }, [activeCategory, allCategories]);

  const activeItems = React.useMemo(
    () =>
      allCategories
        .find((c) => c.id === activeCategory)
        ?.items.filter((i) => i.isAvailable) ?? [],
    [allCategories, activeCategory],
  );

  const totalItems = React.useMemo(
    () => Array.from(cart.values()).reduce((sum, e) => sum + e.quantity, 0),
    [cart],
  );

  const totalPrice = React.useMemo(
    () =>
      Array.from(cart.values()).reduce(
        (sum, e) => sum + e.item.basePrice * e.quantity,
        0,
      ),
    [cart],
  );

  function handleAdd(item: MenuItem) {
    setCart((prev) => {
      const next = new Map(prev);
      const entry = next.get(item.id);
      next.set(item.id, {
        item,
        quantity: (entry?.quantity ?? 0) + 1,
        notes: entry?.notes ?? "",
      });
      return next;
    });
  }

  function handleRemove(itemId: string) {
    setCart((prev) => {
      const next = new Map(prev);
      const entry = next.get(itemId);
      if (!entry) return prev;
      if (entry.quantity <= 1) {
        next.delete(itemId);
      } else {
        next.set(itemId, { ...entry, quantity: entry.quantity - 1 });
      }
      return next;
    });
  }

  function handleNotesChange(itemId: string, notes: string) {
    setCart((prev) => {
      const next = new Map(prev);
      const entry = next.get(itemId);
      if (!entry) return prev;
      next.set(itemId, { ...entry, notes });
      return next;
    });
  }

  function handleClear() {
    setCart(new Map());
  }

  async function handleSubmit() {
    if (cart.size === 0) return;

    const items = Array.from(cart.values()).map((e) => ({
      menuItemId: e.item.id,
      quantity: e.quantity,
      selectedModifiers: [],
      ...(e.notes.trim() ? { notes: e.notes.trim() } : {}),
    }));

    await createOrder.mutateAsync(
      { sessionId, body: { items } },
      {
        onSuccess: () => {
          setCart(new Map());
          onClose();
        },
      },
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Adicionar itens"
      className="lg:w-[600px]"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : allCategories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center px-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
          <Text variant="body" muted>
            Cardápio não disponível
          </Text>
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-border scrollbar-none">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="px-4 pb-2">
            {activeItems.length === 0 ? (
              <div className="py-8 text-center">
                <Text variant="sm" muted>
                  Nenhum item disponível nesta categoria.
                </Text>
              </div>
            ) : (
              activeItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  entry={cart.get(item.id)}
                  onAdd={() => handleAdd(item)}
                  onRemove={() => handleRemove(item.id)}
                  onNotesChange={(notes) => handleNotesChange(item.id, notes)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Footer cart summary */}
      {totalItems > 0 && (
        <div className="border-t border-border px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Limpar
          </button>
          <div className="flex-1" />
          <Text variant="sm" muted>
            {totalItems} {totalItems === 1 ? "item" : "itens"} ·{" "}
            {formatPrice(totalPrice)}
          </Text>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={createOrder.isPending}
            loading={createOrder.isPending}
          >
            Lançar pedido
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}
