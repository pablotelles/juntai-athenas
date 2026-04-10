"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { Button } from "@/components/primitives/button/Button";
import { FAB } from "@/components/primitives/fab/FAB";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useMenu, usePatchItem, useDeleteItem } from "../hooks";
import { ProductCard } from "./ProductCard";
import type { MenuItem, MenuWithCategories } from "@juntai/types";

interface ProductListProps {
  categoryId: string;
  menuId: string;
  restaurantId: string;
  locationId: string | null;
}

export function ProductList({
  categoryId,
  menuId,
  restaurantId,
  locationId,
}: ProductListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const builderHref = `/products/new?categoryId=${categoryId}&menuId=${menuId}${locationId ? `&locationId=${locationId}` : ""}`;
  const navigateToBuilder = () => router.push(builderHref);

  const { data: menus, isLoading } = useMenu(restaurantId, locationId);
  const patchItem = usePatchItem(restaurantId);
  const deleteItem = useDeleteItem(restaurantId);

  const menu: MenuWithCategories | undefined = menus?.find(
    (m) => m.id === menuId,
  );
  const category = menu?.categories.find((c) => c.id === categoryId);
  const items = category?.items ?? [];

  const handleToggleAvailable = (item: MenuItem) => {
    patchItem.mutate(
      {
        itemId: item.id,
        body: { restaurantId, isAvailable: !item.isAvailable },
      },
      {
        onSuccess: () =>
          toast.success(
            item.isAvailable ? "Produto ocultado" : "Produto disponível",
          ),
        onError: () => toast.error("Erro ao atualizar produto"),
      },
    );
  };

  const handleDelete = (item: MenuItem) => {
    // cascadeOptions=false: desvincula as opções que referenciam este item (fallback local preservado)
    deleteItem.mutate(
      { itemId: item.id, cascadeOptions: false },
      {
        onSuccess: () =>
          toast.success("Produto excluído", {
            description: `"${item.name}" removido.`,
          }),
        onError: () => toast.error("Erro ao excluir produto"),
      },
    );
  };

  const handleEdit = (item: MenuItem) => {
    router.push(
      `/products/${item.id}/edit?categoryId=${categoryId}&menuId=${menuId}${locationId ? `&locationId=${locationId}` : ""}`,
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-20 rounded-lg border border-border bg-secondary/30 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text variant="sm" muted>
          {items.length} produto{items.length !== 1 ? "s" : ""}
        </Text>
        {/* Desktop: inline button. Mobile: replaced by FAB below */}
        <Button size="sm" onClick={navigateToBuilder} className="hidden lg:inline-flex">
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Package size={32} className="opacity-40" />
          <Text variant="sm">Nenhum produto nesta categoria.</Text>
          <Button variant="outline" size="sm" onClick={navigateToBuilder}>
            Criar primeiro produto
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onToggleAvailable={handleToggleAvailable}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <FAB label="Novo produto" onClick={navigateToBuilder} />
    </div>
  );
}
