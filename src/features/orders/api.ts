import { createJuntaiClient } from "@juntai/types";
import type { OrderStatus } from "@juntai/types";
import type { OrdersPage, ListOrdersParams } from "@juntai/types";

export type { OrdersPage, ListOrdersParams, OrderStatus };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function listOrders(
  restaurantId: string,
  token: string | null,
  params: ListOrdersParams = {},
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).orders.list(
    restaurantId,
    params,
  );
}

export function updateOrderStatus(
  orderId: string,
  restaurantId: string,
  status: OrderStatus,
  token: string | null,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).orders.updateStatus(
    orderId,
    restaurantId,
    status,
  );
}
