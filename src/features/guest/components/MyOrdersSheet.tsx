"use client";

import * as React from "react";
import { ClipboardList } from "lucide-react";
import { BottomSheet } from "@/components/primitives/bottom-sheet/BottomSheet";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import { useSessionOrders } from "@/features/guest/hooks";
import type { Order, OrderStatus } from "@juntai/types";

// ── Status display config ─────────────────────────────────────────────────────

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "warning" | "info" | "success" | "secondary" | "destructive" }
> = {
  PENDING: { label: "Aguardando", variant: "warning" },
  PREPARING: { label: "Preparando…", variant: "info" },
  DELIVERED: { label: "Entregue", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

function fmtPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Single order card ─────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const cfg = statusConfig[order.status];
  const total = order.items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );

  return (
    <div className="rounded-xl border border-border bg-surface p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Text variant="xs" muted className="tabular-nums">
          {fmtTime(order.createdAt)}
        </Text>
        <Badge variant={cfg.variant} dot>
          {cfg.label}
        </Badge>
      </div>

      <div className="flex flex-col gap-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-2">
            <Text variant="xs" className="flex-1 leading-snug">
              {item.quantity}× {item.snapshot.name}
            </Text>
            <Text variant="xs" muted className="shrink-0 tabular-nums">
              {fmtPrice(item.unitPrice * item.quantity)}
            </Text>
          </div>
        ))}
      </div>

      <div className="flex justify-end border-t border-border pt-2">
        <Text variant="xs" className="font-semibold">
          Total: {fmtPrice(total)}
        </Text>
      </div>
    </div>
  );
}

// ── Sheet ─────────────────────────────────────────────────────────────────────

export interface MyOrdersSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MyOrdersSheet({ open, onClose }: MyOrdersSheetProps) {
  const { data: orders = [], isLoading } = useSessionOrders();

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <BottomSheet open={open} onClose={onClose} title="Meus pedidos">
      <div className="px-5 py-4 flex flex-col gap-3">
        {isLoading && (
          <div className="flex justify-center py-6">
            <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && sortedOrders.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ClipboardList size={32} className="text-muted-foreground/40" />
            <Text variant="sm" muted>
              Nenhum pedido ainda.
            </Text>
            <Text variant="xs" muted>
              Adicione itens do cardápio para fazer um pedido.
            </Text>
          </div>
        )}

        {sortedOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </BottomSheet>
  );
}
