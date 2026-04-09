export type OrderStatus = "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";

export interface SnapshotModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  description: string | null;
  basePrice: number;
  modifiers: SnapshotModifier[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string | null;
  snapshot: OrderItemSnapshot;
  quantity: number;
  unitPrice: number;
  notes: string | null;
}

export interface Order {
  id: string;
  sessionId: string;
  memberId: string | null;
  restaurantId: string;
  locationId: string;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrdersPage {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
