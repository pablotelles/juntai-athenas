"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Badge, type BadgeVariant } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shared/select/Select";
import { useOrders, useUpdateOrderStatus } from "@/features/orders/hooks";
import type { Order, OrderStatus } from "@/features/orders/types";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PREPARING: "Preparando",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING: "warning",
  PREPARING: "info",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "DELIVERED",
  "CANCELLED",
];

// ── Component ─────────────────────────────────────────────────────────────────

interface OrdersViewProps {
  restaurantId: string;
}

export function OrdersView({ restaurantId }: OrdersViewProps) {
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "ALL">(
    "ALL",
  );

  const { data, isLoading } = useOrders(restaurantId, {
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const { mutate: changeStatus } = useUpdateOrderStatus(restaurantId);

  const COLUMNS: ColumnDef<Order>[] = [
    {
      key: "id",
      header: "Pedido",
      cell: (row) => (
        <code className="font-mono text-xs text-muted-foreground">
          {row.id.slice(0, 8)}
        </code>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: "items",
      header: "Itens",
      cell: (row) => (
        <Text variant="sm">
          {row.items.map((i) => `${i.quantity}× ${i.snapshot.name}`).join(", ")}
        </Text>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (row) => {
        const total = row.items.reduce(
          (sum, i) => sum + i.unitPrice * i.quantity,
          0,
        );
        return (
          <span className="font-medium tabular-nums">
            {(total / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Criado em",
      cell: (row) => (
        <Text variant="xs" muted>
          {new Date(row.createdAt).toLocaleString("pt-BR")}
        </Text>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Text variant="sm" muted>
          Status:
        </Text>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as OrderStatus | "ALL")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={COLUMNS}
        isLoading={isLoading}
        rowActions={[
          {
            label: "Marcar como Preparando",
            onClick: (row) =>
              changeStatus({ orderId: row.id, status: "PREPARING" }),
            hidden: (row) => row.status !== "PENDING",
          },
          {
            label: "Marcar como Entregue",
            onClick: (row) =>
              changeStatus({ orderId: row.id, status: "DELIVERED" }),
            hidden: (row) => row.status !== "PREPARING",
          },
          {
            label: "Cancelar",
            onClick: (row) =>
              changeStatus({ orderId: row.id, status: "CANCELLED" }),
            destructive: true,
            hidden: (row) =>
              row.status === "DELIVERED" || row.status === "CANCELLED",
          },
        ]}
        emptyState={
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <ShoppingBag size={32} className="opacity-40" />
            <Text variant="sm">Nenhum pedido encontrado.</Text>
          </div>
        }
      />
    </div>
  );
}
