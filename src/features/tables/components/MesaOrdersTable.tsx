"use client";

import * as React from "react";
import {
  AlertTriangle,
  Ban,
  ChefHat,
  ChevronDown,
  Loader2,
  PackageCheck,
  Plus,
  QrCode,
  ReceiptText,
  RotateCcw,
  Clock,
} from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Badge } from "@/components/primitives/badge/Badge";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { ConfirmDialog } from "@/components/shared/confirm-dialog/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu/DropdownMenu";
import type { Order, OrderItem, OrderStatus } from "@/features/orders/types";

// ── Status config ─────────────────────────────────────────────────────────────

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

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  PENDING: Clock,
  PREPARING: ChefHat,
  DELIVERED: PackageCheck,
  CANCELLED: Ban,
};

// ── Transition map ────────────────────────────────────────────────────────────

interface Transition {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  destructive?: boolean;
  confirm?: boolean;
}

const TRANSITIONS: Record<OrderStatus, Transition[]> = {
  PENDING: [
    { status: "PREPARING", label: "Iniciar preparo", icon: ChefHat },
    { status: "DELIVERED", label: "Marcar como entregue", icon: PackageCheck },
    { status: "CANCELLED", label: "Cancelar pedido", icon: Ban, destructive: true, confirm: true },
  ],
  PREPARING: [
    { status: "DELIVERED", label: "Marcar como entregue", icon: PackageCheck },
    { status: "PENDING", label: "Reverter para pendente", icon: RotateCcw },
    { status: "CANCELLED", label: "Cancelar pedido", icon: Ban, destructive: true, confirm: true },
  ],
  DELIVERED: [
    { status: "PREPARING", label: "Reverter para em preparo", icon: RotateCcw },
    { status: "PENDING", label: "Reverter para pendente", icon: RotateCcw },
  ],
  CANCELLED: [
    { status: "PENDING", label: "Reativar pedido", icon: RotateCcw },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function buildItemLabel(item: OrderItem): string {
  const base = `${item.quantity}× ${item.snapshot.name}`;
  if (item.snapshot.modifiers.length === 0) return base;
  const mods = item.snapshot.modifiers.map((m) => m.optionName).join(", ");
  return `${base} (${mods})`;
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function OrderDetailPanel({ order }: { order: Order }) {
  const total = getOrderTotal(order);

  return (
    <div className="space-y-3">
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
      <div className="flex items-center justify-between border-t border-border pt-2">
        <Text variant="xs" muted>Total</Text>
        <Text variant="sm" className="font-bold tabular-nums">
          {formatPrice(total)}
        </Text>
      </div>
    </div>
  );
}

// ── Status cell with transition dropdown ──────────────────────────────────────

function StatusCell({
  order,
  isUpdating,
  onUpdateStatus,
}: {
  order: Order;
  isUpdating: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}) {
  const [confirmTransition, setConfirmTransition] = React.useState<Transition | null>(null);

  const transitions = TRANSITIONS[order.status] ?? [];
  const StatusIcon = STATUS_ICONS[order.status];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isUpdating}
          className="group flex flex-col items-start gap-0.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Badge variant={STATUS_VARIANTS[order.status]} className="gap-1.5 cursor-pointer">
            {isUpdating ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <StatusIcon size={11} />
            )}
            {STATUS_LABELS[order.status]}
            <ChevronDown
              size={10}
              className="opacity-50 transition-transform group-data-[state=open]:rotate-180"
            />
          </Badge>
          <Text variant="xs" muted className="pl-0.5">
            {formatElapsed(order.createdAt)} atrás
          </Text>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="min-w-52">
          <DropdownMenuLabel>Mover para</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {transitions.map((t) => {
            const Icon = t.icon;
            return (
              <DropdownMenuItem
                key={t.status}
                destructive={t.destructive}
                onClick={() => {
                  if (t.confirm) {
                    setConfirmTransition(t);
                  } else {
                    onUpdateStatus(order.id, t.status);
                  }
                }}
              >
                <Icon size={14} />
                {t.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={!!confirmTransition}
        onOpenChange={(open) => !open && setConfirmTransition(null)}
        title="Cancelar pedido"
        description={`Cancelar pedido #${order.id.slice(0, 8)}? Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar pedido"
        destructive
        onConfirm={() => {
          if (confirmTransition) {
            onUpdateStatus(order.id, confirmTransition.status);
            setConfirmTransition(null);
          }
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
        width: "10rem",
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
        width: "13rem",
        cell: (order) => (
          <StatusCell
            order={order}
            isUpdating={updatingOrderId === order.id}
            onUpdateStatus={onUpdateOrderStatus}
          />
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
