import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { listOrders, updateOrderStatus, type ListOrdersParams } from "./api";
import type { OrderStatus } from "./types";

export function useOrders(restaurantId: string, params: ListOrdersParams = {}) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["orders", restaurantId, params],
    queryFn: () => listOrders(restaurantId, sessionToken, params),
    enabled: !!restaurantId,
  });
}

export function useUpdateOrderStatus(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, restaurantId, status, sessionToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["orders", restaurantId],
      });
    },
  });
}
