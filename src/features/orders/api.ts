import { apiClient } from "@/lib/api";
import type { OrdersPage, OrderStatus } from "./types";

export interface ListOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export function listOrders(
  restaurantId: string,
  token: string | null,
  params: ListOrdersParams = {},
) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return apiClient(token).get<OrdersPage>(
    `/restaurants/${restaurantId}/orders${qs ? `?${qs}` : ""}`,
  );
}

export function updateOrderStatus(
  orderId: string,
  restaurantId: string,
  status: OrderStatus,
  token: string | null,
) {
  return apiClient(token).put<void>(`/orders/${orderId}/status`, {
    status,
    restaurantId,
  });
}
