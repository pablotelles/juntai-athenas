"use client";

import * as React from "react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Badge } from "@/components/primitives/badge/Badge";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { ReceiptText, Plus, QrCode } from "lucide-react";
import type { Order, OrderStatus } from "@/features/orders/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PREPARING: "Preparando",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANTS: Record<
  OrderStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  PENDING: "warning",
  PREPARING: "info",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatElapsed(value?: string | null) {
  if (!value) return "Agora";
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );

  if (diffMinutes < 60) return `${diffMinutes} min`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

function getNextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "PENDING") return "PREPARING";
  if (status === "PREPARING") return "DELIVERED";
  return null;
}

function getOrderTotal(order: {
  items: Array<{ quantity: number; unitPrice: number }>;
}) {
  return order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
}

export interface MesaOrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  updatingOrderId?: string | null;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAddFirstItem: () => void;
}

export function MesaOrdersTable({
  orders,
  isLoading = false,
  updatingOrderId,
  onUpdateOrderStatus,
  onAddFirstItem,
}: MesaOrdersTableProps) {
  const columns = React.useMemo<ColumnDef<Order>[]>(
    () => [
      {
        key: "id",
        header: "Pedido",
        width: "12rem",
        cell: (order) => (
          <div className="space-y-1">
            <Text variant="sm" className="font-semibold">
              Pedido #{order.id.slice(0, 8)}
            </Text>
            <Text variant="xs" muted>
              {formatDateTime(order.createdAt)}
            </Text>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: "10rem",
        cell: (order) => (
          <div className="space-y-1">
            <Badge variant={STATUS_VARIANTS[order.status]}>
              {STATUS_LABELS[order.status]}
            </Badge>
            <Text variant="xs" muted>
              Aberto há {formatElapsed(order.createdAt)}
            </Text>
          </div>
        ),
      },
      {
        key: "items",
        header: "Itens",
        cell: (order) => (
          <div className="space-y-1">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <Text variant="sm" className="font-medium">
                    {item.quantity}x {item.snapshot.name}
                  </Text>
                  {item.notes ? (
                    <Text variant="xs" muted className="mt-0.5">
                      Obs.: {item.notes}
                    </Text>
                  ) : null}
                </div>
                <Text variant="xs" muted className="shrink-0 whitespace-nowrap">
                  {formatPrice(item.unitPrice * item.quantity)}
                </Text>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "total",
        header: "Total",
        align: "right",
        width: "8rem",
        cell: (order) => (
          <Text variant="sm" className="font-semibold tabular-nums">
            {formatPrice(getOrderTotal(order))}
          </Text>
        ),
      },
      {
        key: "actions",
        header: "Ações",
        align: "right",
        width: "16rem",
        cell: (order) => {
          const nextStatus = getNextStatus(order.status);
          const isUpdating = updatingOrderId === order.id;
          const canCancel =
            order.status !== "DELIVERED" && order.status !== "CANCELLED";

          return (
            <div className="flex flex-wrap justify-end gap-2">
              {nextStatus ? (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isUpdating}
                  onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                >
                  {nextStatus === "PREPARING" ? "Preparar" : "Entregar"}
                </Button>
              ) : null}
              {canCancel ? (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={isUpdating && !nextStatus}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onUpdateOrderStatus(order.id, "CANCELLED")}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [onUpdateOrderStatus, updatingOrderId],
  );

  return (
    <DataTable
      data={orders}
      columns={columns}
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-start gap-4 py-2 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <Text variant="h4">Nenhum pedido ainda</Text>
            <Text variant="sm" muted className="mt-2 max-w-xl">
              Comece adicionando um item à comanda. O fluxo ideal aqui é buscar,
              tocar no item e continuar lançando sem sair da tela.
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={onAddFirstItem}>
              <Plus className="h-4 w-4" />
              Adicionar primeiro item
            </Button>
            <Button variant="outline" onClick={onAddFirstItem}>
              <QrCode className="h-4 w-4" />
              Buscar rápido
            </Button>
          </div>
        </div>
      }
    />
  );
}
