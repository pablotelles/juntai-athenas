"use client";

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
