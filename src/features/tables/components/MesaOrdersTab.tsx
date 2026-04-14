"use client";

import { Badge } from "@/components/primitives/badge/Badge";
import { CardTitle } from "@/components/shared/card/Card";
import type { Order, OrderStatus } from "@/features/orders/types";
import { MesaOrdersTable } from "./MesaOrdersTable";

export interface MesaOrdersTabProps {
  orders: Order[];
  isLoading?: boolean;
  updatingOrderId?: string | null;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus | null) => void;
  onAddItem: () => void;
}

export function MesaOrdersTab({
  orders,
  isLoading = false,
  updatingOrderId,
  onUpdateOrderStatus,
  onAddItem,
}: MesaOrdersTabProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <CardTitle className="text-base">Pedidos</CardTitle>
        <Badge variant="secondary">
          {orders.length} pedido{orders.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <MesaOrdersTable
        orders={orders}
        isLoading={isLoading}
        updatingOrderId={updatingOrderId}
        onUpdateOrderStatus={onUpdateOrderStatus}
        onAddFirstItem={onAddItem}
      />
    </section>
  );
}
