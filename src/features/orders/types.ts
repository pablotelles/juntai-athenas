import type { Order } from "@juntai/types";

// Re-exportados de @juntai/types — fonte canônica
export type {
  OrderStatus,
  SnapshotModifier,
  SnapshotStepSelection,
  SnapshotStep,
  OrderItemSnapshot,
  OrderItem,
  Order,
} from "@juntai/types";

// Athenas-specific: paginação de pedidos
export interface OrdersPage {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
