"use client";

import * as React from "react";
import { AlertTriangle, Plus, QrCode, ReceiptText } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Badge } from "@/components/primitives/badge/Badge";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog/ConfirmDialog";
import type { Order, OrderItem, OrderStatus } from "@/features/orders/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PREPARING: "Em preparo",
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

function formatElapsed(value: string) {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  if (diffMinutes < 60) return `${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

function getOrderTotal(order: Order) {
  return order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

/** "2x Gyoza, 1x Heineken" — truncado se muito longo */
function buildItemsSummary(items: OrderItem[]): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.snapshot.name, (counts.get(item.snapshot.name) ?? 0) + item.quantity);
  }
  const parts = Array.from(counts.entries()).map(([name, qty]) => `${qty}× ${name}`);
  const full = parts.join(", ");
  if (full.length <= 48) return full;
  const total = items.reduce((a, i) => a + i.quantity, 0);
  return `${total} ${total === 1 ? "item" : "itens"}`;
}

// ── Detail panel (rendered inside expanded row) ───────────────────────────────

/** Formata item como "2× Gyoza (Frango, Porco)" */
function buildItemLabel(item: OrderItem): string {
  const base = `${item.quantity}× ${item.snapshot.name}`;
  if (item.snapshot.modifiers.length === 0) return base;
  const mods = item.snapshot.modifiers.map((m) => m.optionName).join(", ");
  return `${base} (${mods})`;
}

function OrderDetailPanel({ order }: { order: Order }) {
  const total = getOrderTotal(order);

  return (
    <div className="space-y-3">
      {/* Items */}
      <div className="space-y-1.5">
        {order.items.map((item) => (
          <div key={item.id}>
            <div className="flex items-baseline justify-between gap-2">
              <Text variant="sm" className="font-medium">
                {buildItemLabel(item)}
              </Text>
              <Text variant="sm" muted className="shrink-0 tabular-nums whitespace-nowrap">
                {formatPrice(item.unitPrice * item.quantity)}
              </Text>
            </div>
            {item.notes && (
              <div className="mt-1 flex items-start gap-1.5 rounded bg-warning/10 px-2 py-1">
                <AlertTriangle size={11} className="text-warning mt-px shrink-0" />
                <Text variant="xs" className="text-warning leading-snug">
                  {item.notes}
                </Text>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <Text variant="xs" muted>Total</Text>
        <Text variant="sm" className="font-bold tabular-nums">
          {formatPrice(total)}
        </Text>
      </div>
    </div>
  );
}

// ── Actions cell — needs local confirm state per row ──────────────────────────

function ActionsCell({
  order,
  isUpdating,
  onUpdateStatus,
}: {
  order: Order;
  isUpdating: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}) {
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const canPrepare = order.status === "PENDING";
  const canDeliver = order.status === "PREPARING";
  const canCancel = order.status !== "DELIVERED" && order.status !== "CANCELLED";

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        {canPrepare && (
          <Button
            size="sm"
            variant="outline"
            loading={isUpdating}
            onClick={() => onUpdateStatus(order.id, "PREPARING")}
          >
            Preparar
          </Button>
        )}
        {canDeliver && (
          <Button
            size="sm"
            loading={isUpdating}
            onClick={() => onUpdateStatus(order.id, "DELIVERED")}
            className="bg-success hover:bg-success/90 text-white border-transparent"
          >
            Entregar
          </Button>
        )}
        {canCancel && (
          <Button
            size="sm"
            variant="ghost"
            loading={isUpdating && !canPrepare && !canDeliver}
            onClick={() => setConfirmCancel(true)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Cancelar
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancelar pedido"
        description={`Cancelar pedido #${order.id.slice(0, 8)}? Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar pedido"
        destructive
        onConfirm={() => {
          onUpdateStatus(order.id, "CANCELLED");
          setConfirmCancel(false);
        }}
      />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
        width: "11rem",
        cell: (order) => (
          <div className="space-y-0.5">
            <Text variant="sm" className="font-semibold tabular-nums">
              #{order.id.slice(0, 8)}
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
          <div className="space-y-0.5">
            <Badge variant={STATUS_VARIANTS[order.status]} dot>
              {STATUS_LABELS[order.status]}
            </Badge>
            <Text variant="xs" muted>
              {formatElapsed(order.createdAt)} atrás
            </Text>
          </div>
        ),
      },
      {
        key: "items",
        header: "Itens",
        cell: (order) => (
          <Text variant="sm" muted className="truncate max-w-xs">
            {buildItemsSummary(order.items)}
          </Text>
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
        cell: (order) => (
          <ActionsCell
            order={order}
            isUpdating={updatingOrderId === order.id}
            onUpdateStatus={onUpdateOrderStatus}
          />
        ),
      },
    ],
    [onUpdateOrderStatus, updatingOrderId],
  );

  return (
    <DataTable
      data={orders}
      columns={columns}
      isLoading={isLoading}
      rowId={(order) => order.id}
      rowDetail={(order) => <OrderDetailPanel order={order} />}
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
