"use client";

import * as React from "react";
import { LayoutList } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import { LocationPicker } from "@/features/restaurants/components/LocationPicker";
import { useTables } from "@/features/tables/hooks";
import { useLocations } from "@/features/restaurants/hooks";
import type { Table } from "@/features/tables/types";

const COLUMNS: ColumnDef<Table>[] = [
  {
    key: "label",
    header: "Mesa",
    cell: (row) => <span className="font-medium">{row.label}</span>,
  },
  {
    key: "capacity",
    header: "Capacidade",
    cell: (row) =>
      row.capacity ? (
        <span>{row.capacity} pessoas</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "isActive",
    header: "Status",
    cell: (row) => (
      <Badge variant={row.isActive ? "success" : "secondary"}>
        {row.isActive ? "Ativa" : "Inativa"}
      </Badge>
    ),
  },
  {
    key: "qrCodeToken",
    header: "QR Token",
    cell: (row) => (
      <code className="text-xs text-muted-foreground font-mono">
        {row.qrCodeToken.slice(0, 8)}…
      </code>
    ),
  },
];

interface TablesViewProps {
  restaurantId: string;
}

export function TablesView({ restaurantId }: TablesViewProps) {
  const { data: locations } = useLocations(restaurantId);
  const [locationId, setLocationId] = React.useState<string | null>(null);

  // Auto-select first location
  React.useEffect(() => {
    if (locations && locations.length > 0 && !locationId) {
      setLocationId(locations[0].id);
    }
  }, [locations, locationId]);

  const { data: tables, isLoading } = useTables(restaurantId, locationId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Text variant="sm" muted>
          Filial:
        </Text>
        <LocationPicker
          restaurantId={restaurantId}
          value={locationId}
          onChange={setLocationId}
        />
      </div>

      <DataTable
        data={tables ?? []}
        columns={COLUMNS}
        isLoading={isLoading}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <LayoutList size={32} className="opacity-40" />
            <Text variant="sm">Nenhuma mesa cadastrada nesta filial.</Text>
          </div>
        }
      />
    </div>
  );
}
