"use client";

import * as React from "react";
import { Package, Plus } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { Button } from "@/components/primitives/button/Button";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useMenu, usePatchItem, useDeleteItem } from "../hooks";
import { ProductCard } from "./ProductCard";
import { ProductBuilder } from "./ProductBuilder";
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
  const { toast } = useToast();
  const [builderOpen, setBuilderOpen] = React.useState(false);

  const { data: menus, isLoading } = useMenu(restaurantId, locationId);
  const patchItem = usePatchItem(restaurantId);
  const deleteItem = useDeleteItem(restaurantId);

  const menu: MenuWithCategories | undefined = menus?.find((m) => m.id === menuId);
  const category = menu?.categories.find((c) => c.id === categoryId);
  const items = category?.items ?? [];

  const handleToggleAvailable = (item: MenuItem) => {
    patchItem.mutate(
      { itemId: item.id, body: { restaurantId, isAvailable: !item.isAvailable } },
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
    deleteItem.mutate(item.id, {
      onSuccess: () =>
        toast.success("Produto excluído", { description: `"${item.name}" removido.` }),
      onError: () => toast.error("Erro ao excluir produto"),
    });
  };

  const handleEdit = (_item: MenuItem) => {
    // TODO: abrir builder em modo edição
    toast.info("Edição em desenvolvimento.");
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
        <Button size="sm" onClick={() => setBuilderOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Package size={32} className="opacity-40" />
          <Text variant="sm">Nenhum produto nesta categoria.</Text>
          <Button variant="outline" size="sm" onClick={() => setBuilderOpen(true)}>
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

      <ProductBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        categoryId={categoryId}
        restaurantId={restaurantId}
        locationId={locationId}
      />
    </div>
  );
}
