import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGuest } from "@/features/guest/context/GuestContext";
import {
  fetchGuestMenu,
  createGuestOrder,
  fetchSessionOrders,
  type CreateGuestOrderBody,
} from "./api";

export function useGuestMenu() {
  const { token, sessionId } = useGuest();
  return useQuery({
    queryKey: ["guest-menu", sessionId],
    queryFn: () => fetchGuestMenu(token!, sessionId),
    enabled: !!token,
    staleTime: 5 * 60_000,
  });
}

/**
 * Fetch orders for a session using an explicit token (doesn't require GuestContext).
 * Useful in components like GuestSessionView that receive token as a prop.
 */
export function useSessionOrdersByToken(
  sessionId: string,
  token: string | null,
) {
  return useQuery({
    queryKey: ["orders", sessionId],
    queryFn: () => fetchSessionOrders(token!, sessionId),
    enabled: !!token,
    refetchInterval: 15_000,
  });
}

export function useSessionOrders() {
  const { token, sessionId } = useGuest();
  return useQuery({
    queryKey: ["orders", sessionId],
    queryFn: () => fetchSessionOrders(token!, sessionId),
    enabled: !!token,
    refetchInterval: 10_000,
  });
}

export function useCreateOrder() {
  const { token, sessionId } = useGuest();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGuestOrderBody) =>
      createGuestOrder(token!, sessionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", sessionId] });
    },
  });
}
