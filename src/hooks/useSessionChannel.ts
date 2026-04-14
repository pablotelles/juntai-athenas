"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { RealtimeEnvelope } from "@juntai/types";
import { useWebSocket, type WsStatus } from "@/hooks/useWebSocket";
import { useToast } from "@/contexts/toast/ToastProvider";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function wsUrl(sessionId: string, token: string): string {
  const base = BASE_URL.replace(/^http/, "ws");
  return `${base}/ws/session/${sessionId}?token=${token}`;
}

interface UseSessionChannelOptions {
  sessionId: string | null;
  /** Token returned by POST /sessions/:sessionId/guest-join or /sessions/:sessionId/join */
  token: string | null;
  /** Optional callback invoked for every received envelope (e.g. to feed an event log). */
  onEvent?: (envelope: RealtimeEnvelope) => void;
}

interface UseSessionChannelResult {
  status: WsStatus;
}

/**
 * Subscribes to the `/ws/session/:sessionId` channel.
 * Invalidates React Query caches and shows toasts for key events.
 */
export function useSessionChannel({
  sessionId,
  token,
  onEvent,
}: UseSessionChannelOptions): UseSessionChannelResult {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const url = React.useMemo(
    () => (sessionId && token ? wsUrl(sessionId, token) : null),
    [sessionId, token],
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
            queryKey: ["session", sessionId],
          });
          void queryClient.invalidateQueries({
            queryKey: ["session-members", sessionId],
          });
          break;

        case "ORDER_CREATED":
          void queryClient.invalidateQueries({
            queryKey: ["orders", sessionId],
          });
          toast.info("Novo pedido registrado");
          break;

        case "ORDER_STATUS_CHANGED":
          void queryClient.invalidateQueries({
            queryKey: ["orders", sessionId],
          });
          break;

        case "PAYMENT_COMPLETED":
          void queryClient.invalidateQueries({
            queryKey: ["payments", sessionId],
          });
          toast.success("Pagamento confirmado");
          break;

        case "SESSION_CLOSED":
          void queryClient.invalidateQueries({
            queryKey: ["session", sessionId],
          });
          toast.warning("A mesa foi encerrada");
          break;

        case "CONNECTION_READY":
          break;
      }
    },
    [queryClient, sessionId, toast],
  );

  return useWebSocket<RealtimeEnvelope>({ url, onMessage: handleMessage });
}
