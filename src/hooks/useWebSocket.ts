"use client";

import * as React from "react";

export type WsStatus = "connecting" | "open" | "closed" | "error";

interface UseWebSocketOptions<T> {
  /** Full WS URL including `?token=` query string. Pass `null` to skip. */
  url: string | null;
  onMessage: (event: T) => void;
  /** Reconnect delay in ms. Default: 3000. Pass 0 to disable. */
  reconnectDelay?: number;
}

interface UseWebSocketResult {
  status: WsStatus;
}

/**
 * Generic, self-reconnecting WebSocket hook.
 * Parses each incoming frame as JSON and calls `onMessage`.
 * Closes cleanly on unmount or when `url` changes.
 */
export function useWebSocket<T>({
  url,
  onMessage,
  reconnectDelay = 3000,
}: UseWebSocketOptions<T>): UseWebSocketResult {
  const [status, setStatus] = React.useState<WsStatus>("closed");

  // Keep stable refs so reconnect closure always uses latest values
  const onMessageRef = React.useRef(onMessage);
  React.useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  React.useEffect(() => {
    if (!url) {
      setStatus("closed");
      return;
    }

    let ws: WebSocket;
    let destroyed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (destroyed) return;
      setStatus("connecting");
      ws = new WebSocket(url as string);

      ws.onopen = () => {
        if (!destroyed) setStatus("open");
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string) as T;
          onMessageRef.current(data);
        } catch {
          // Non-JSON frames (e.g. "pong") — ignore
        }
      };

      ws.onerror = () => {
        if (!destroyed) setStatus("error");
      };

      ws.onclose = (ev) => {
        if (destroyed) return;
        // 4xxx = application-level rejection (auth, forbidden, etc.) — don't retry
        if (ev.code >= 4000) {
          setStatus("closed");
          return;
        }
        setStatus("closed");
        if (reconnectDelay > 0) {
          retryTimer = setTimeout(connect, reconnectDelay);
        }
      };
    }

    connect();

    return () => {
      destroyed = true;
      if (retryTimer !== null) clearTimeout(retryTimer);
      ws?.close();
    };
  }, [url, reconnectDelay]);

  return { status };
}
