"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimeEnvelope } from "@juntai/types";
import { useWebSocket, type WsStatus } from "@/hooks/useWebSocket";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function wsUrl(locationId: string, token: string): string {
  const base = BASE_URL.replace(/^http/, "ws");
  return `${base}/ws/location/${locationId}?token=${token}`;
}

interface UseLocationChannelOptions {
  locationId: string | null;
  restaurantId: string | null;
  /** Staff Bearer token */
  token: string | null;
  /** Optional callback invoked for every received envelope, before cache invalidation. */
  onEvent?: (envelope: RealtimeEnvelope) => void;
}

interface UseLocationChannelResult {
  status: WsStatus;
}

/**
 * Subscribes to the `/ws/location/:locationId` channel.
 * Automatically invalidates relevant React Query caches when events arrive.
 */
export function useLocationChannel({
  locationId,
  restaurantId,
  token,
  onEvent,
}: UseLocationChannelOptions): UseLocationChannelResult {
  const queryClient = useQueryClient();

  const url = React.useMemo(
    () => (locationId && token ? wsUrl(locationId, token) : null),
    [locationId, token],
  );

  const onEventRef = React.useRef(onEvent);
  React.useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const handleMessage = React.useCallback(
    (envelope: RealtimeEnvelope) => {
      onEventRef.current?.(envelope);
      switch (envelope.type) {
        case "USER_JOINED":
        case "USER_LEFT":
          void queryClient.invalidateQueries({
            queryKey: ["tables", restaurantId, locationId],
          });
          void queryClient.invalidateQueries({
            queryKey: ["session-members"],
          });
          break;

        case "ORDER_CREATED":
        case "ORDER_STATUS_CHANGED":
          void queryClient.invalidateQueries({
            queryKey: ["orders", restaurantId],
          });
          // session-orders é usado pela MesaModal para listar pedidos por sessão
          void queryClient.invalidateQueries({
            queryKey: ["session-orders"],
          });
          break;

        case "PAYMENT_COMPLETED":
          void queryClient.invalidateQueries({
            queryKey: ["payments", restaurantId],
          });
          break;

        case "SESSION_CLOSED":
          void queryClient.invalidateQueries({
            queryKey: ["tables", restaurantId, locationId],
          });
          break;

        case "CONNECTION_READY":
          break;
      }
    },
    [queryClient, restaurantId, locationId],
  );

  return useWebSocket<RealtimeEnvelope>({ url, onMessage: handleMessage });
}
