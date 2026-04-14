import type { Order, OrderStatus } from "@/features/orders/types";
import type { TableSessionMember } from "./api";

export interface MemberAttributedItem {
  id: string;
  orderId: string;
  orderStatus: OrderStatus;
  orderCreatedAt: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}

export interface MesaMemberConsumptionSummary {
  member: TableSessionMember;
  orders: Order[];
  items: MemberAttributedItem[];
  totalConsumption: number;
  totalItems: number;
}

export interface MesaUnassignedOrdersSummary {
  orders: Order[];
  totalConsumption: number;
  totalItems: number;
}

export interface MesaMemberAttributionResult {
  memberSummaries: MesaMemberConsumptionSummary[];
  unassigned: MesaUnassignedOrdersSummary;
}

function getOrderTotal(order: Order) {
  return order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
}

function mapOrderItems(order: Order): MemberAttributedItem[] {
  return order.items.map((item) => ({
    id: item.id,
    orderId: order.id,
    orderStatus: order.status,
    orderCreatedAt: order.createdAt,
    name: item.snapshot.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.unitPrice * item.quantity,
    notes: item.notes,
  }));
}

export function buildMesaMemberAttribution(
  members: TableSessionMember[],
  orders: Order[],
): MesaMemberAttributionResult {
  const ordersByMemberId = new Map<string, Order[]>();

  for (const order of orders) {
    if (!order.memberId) continue;
    const currentOrders = ordersByMemberId.get(order.memberId) ?? [];
    currentOrders.push(order);
    ordersByMemberId.set(order.memberId, currentOrders);
  }

  const memberSummaries = members.map((member) => {
    const memberOrders = ordersByMemberId.get(member.id) ?? [];
    const items = memberOrders.flatMap(mapOrderItems);

    return {
      member,
      orders: memberOrders,
      items,
      totalConsumption: memberOrders.reduce(
        (sum, order) => sum + getOrderTotal(order),
        0,
      ),
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    } satisfies MesaMemberConsumptionSummary;
  });

  const unassignedOrders = orders.filter((order) => !order.memberId);
  const unassignedItems = unassignedOrders.flatMap((order) => order.items);

  return {
    memberSummaries,
    unassigned: {
      orders: unassignedOrders,
      totalConsumption: unassignedOrders.reduce(
        (sum, order) => sum + getOrderTotal(order),
        0,
      ),
      totalItems: unassignedItems.reduce((sum, item) => sum + item.quantity, 0),
    },
  };
}
