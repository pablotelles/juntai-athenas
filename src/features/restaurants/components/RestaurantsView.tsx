"use client";

import { UtensilsCrossed } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Text } from "@/components/primitives/text/Text";
import { useAllRestaurants } from "@/features/restaurants/hooks";
import type { Restaurant } from "@/features/restaurants/types";

const COLUMNS: ColumnDef<Restaurant>[] = [
  {
    key: "name",
    header: "Nome",
    sortable: true,
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "slug",
    header: "Slug",
    cell: (row) => (
      <code className="text-xs text-muted-foreground font-mono">
        {row.slug}
      </code>
    ),
  },
  {
    key: "createdAt",
    header: "Criado em",
    cell: (row) => (
      <Text variant="xs" muted>
        {new Date(row.createdAt).toLocaleDateString("pt-BR")}
      </Text>
    ),
  },
];

export function RestaurantsView() {
  const { data: restaurants, isLoading } = useAllRestaurants();

  return (
    <DataTable
      data={restaurants ?? []}
      columns={COLUMNS}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <UtensilsCrossed size={32} className="opacity-40" />
          <Text variant="sm">Nenhum restaurante cadastrado.</Text>
        </div>
      }
    />
  );
}
