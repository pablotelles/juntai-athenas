"use client";

import * as React from "react";
import { Minus, Plus, ReceiptText, Search, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SearchInput } from "@/components/primitives/search-input/SearchInput";
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

interface CategorySection {
  id: string;
  name: string;
  items: MenuItem[];
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
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Text variant="body" className="truncate font-medium">
            {item.name}
          </Text>
          {item.description ? (
            <Text variant="sm" muted className="mt-1 line-clamp-2">
              {item.description}
            </Text>
          ) : null}
        </div>
        <Text variant="sm" className="font-semibold text-primary">
          {formatPrice(item.basePrice)}
        </Text>
      </div>

      {requiresConfiguration ? (
        <Text variant="xs" muted className="mt-2">
          Requer configuração de complementos antes do lançamento.
        </Text>
      ) : null}

      {qty > 0 ? (
        <div className="mt-3">
          <Text variant="xs" muted>
            Observação rápida
          </Text>
          <textarea
            className="mt-1 min-h-20 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Ex.: sem cebola, molho à parte"
            value={entry?.notes ?? ""}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-2">
          {qty > 0 ? (
            <>
              <button
                type="button"
                onClick={onRemove}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {qty}
              </span>
            </>
          ) : (
            <Text variant="xs" muted>
              Toque no + para adicionar
            </Text>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={requiresConfiguration}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {qty > 0 ? "Adicionar mais" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}

function OrderSummaryRow({
  entry,
  onAdd,
  onRemove,
  onNotesChange,
}: {
  entry: CartEntry;
  onAdd: () => void;
  onRemove: () => void;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Text variant="sm" className="font-medium">
            {entry.item.name}
          </Text>
          <Text variant="xs" muted className="mt-1">
            {formatPrice(entry.item.basePrice)} por unidade
          </Text>
        </div>
        <Text variant="sm" className="font-semibold">
          {formatPrice(entry.item.basePrice * entry.quantity)}
        </Text>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-5 text-center text-sm font-semibold tabular-nums">
          {entry.quantity}
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <textarea
        className="mt-3 min-h-16 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        placeholder="Observação opcional"
        value={entry.notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
    </div>
  );
}

function EmptyOrderSummary({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background px-5 py-8 text-center">
      <ReceiptText className="mx-auto h-8 w-8 text-muted-foreground/50" />
      <Text variant="body" className="mt-3 font-semibold">
        Nenhum item no pedido atual
      </Text>
      <Text variant="sm" muted className="mt-2">
        Busque um produto ou toque em adicionar para montar a comanda em
        sequência.
      </Text>
      <Button className="mt-4" variant="outline" onClick={onQuickAdd}>
        <Search className="h-4 w-4" />
        Buscar item agora
      </Button>
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
  const searchRef = React.useRef<HTMLInputElement>(null);

  const [cart, setCart] = React.useState<Map<string, CartEntry>>(new Map());
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

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

  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      searchRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const normalizedSearch = search.trim().toLowerCase();

  const visibleCategories = React.useMemo<CategorySection[]>(() => {
    const base = allCategories.map((category) => ({
      id: category.id,
      name: category.name,
      items: category.items.filter((item) => item.isAvailable),
    }));

    if (!normalizedSearch) {
      return base.filter((category) => category.id === activeCategory);
    }

    return base
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const haystack = `${item.name} ${item.description ?? ""}`.toLowerCase();
          return haystack.includes(normalizedSearch);
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [activeCategory, allCategories, normalizedSearch]);

  const cartEntries = React.useMemo(
    () => Array.from(cart.values()),
    [cart],
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

  async function handleSubmit(closeAfterSubmit: boolean) {
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
          if (closeAfterSubmit) {
            onClose();
            return;
          }

          searchRef.current?.focus();
        },
      },
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Adicionar itens rapidamente"
      className="lg:w-[1080px]"
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
        <div className="grid gap-4 px-4 pb-4 pt-4 lg:grid-cols-[1.45fr_0.95fr]">
          <section className="min-w-0 rounded-3xl border border-border bg-surface/60">
            <div className="border-b border-border px-4 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Text variant="body" className="font-semibold">
                    Busca rápida de itens
                  </Text>
                  <Text variant="sm" muted>
                    Clique no item para lançar, ajuste quantidade e observação se precisar.
                  </Text>
                </div>
                <div className="w-full lg:max-w-md">
                  <SearchInput
                    ref={searchRef}
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar item, bebida ou sobremesa"
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
                {allCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveCategory(cat.id);
                    }}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      activeCategory === cat.id && !normalizedSearch
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[55vh] space-y-5 overflow-y-auto px-4 py-4">
              {visibleCategories.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
                  <Text variant="body" className="font-semibold">
                    Nenhum item encontrado
                  </Text>
                  <Text variant="sm" muted className="mt-2">
                    Ajuste a busca ou troque de categoria para continuar o lançamento.
                  </Text>
                </div>
              ) : (
                visibleCategories.map((category) => (
                  <div key={category.id}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <Text variant="sm" className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {category.name}
                      </Text>
                      <Text variant="xs" muted>
                        {category.items.length} itens
                      </Text>
                    </div>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          entry={cart.get(item.id)}
                          onAdd={() => handleAdd(item)}
                          onRemove={() => handleRemove(item.id)}
                          onNotesChange={(notes) => handleNotesChange(item.id, notes)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-border bg-surface/60">
            <div className="border-b border-border px-4 py-4">
              <Text variant="body" className="font-semibold">
                Pedido atual
              </Text>
              <Text variant="sm" muted>
                Visualize o que vai entrar na comanda antes de lançar.
              </Text>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-4 py-4">
              {cartEntries.length === 0 ? (
                <EmptyOrderSummary
                  onQuickAdd={() => searchRef.current?.focus()}
                />
              ) : (
                <div className="space-y-3">
                  {cartEntries.map((entry) => (
                    <OrderSummaryRow
                      key={entry.item.id}
                      entry={entry}
                      onAdd={() => handleAdd(entry.item)}
                      onRemove={() => handleRemove(entry.item.id)}
                      onNotesChange={(notes) =>
                        handleNotesChange(entry.item.id, notes)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Footer cart summary */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div>
            <Text variant="sm" className="font-medium">
              {totalItems} {totalItems === 1 ? "item" : "itens"} no pedido atual
            </Text>
            <Text variant="sm" muted>
              Total parcial: {formatPrice(totalPrice)}
            </Text>
          </div>

          <div className="flex-1" />

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={handleClear} disabled={cart.size === 0}>
              Limpar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={cart.size === 0 || createOrder.isPending}
              loading={createOrder.isPending}
            >
              Lançar e continuar
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={cart.size === 0 || createOrder.isPending}
              loading={createOrder.isPending}
            >
              Lançar pedido
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
