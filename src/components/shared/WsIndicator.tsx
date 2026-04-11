import * as React from "react";
import { cn } from "@/lib/cn";
import type { WsStatus } from "@/hooks/useWebSocket";

interface WsIndicatorProps {
  status: WsStatus;
  className?: string;
}

const dotClasses: Record<WsStatus, string> = {
  open: "bg-success",
  connecting: "bg-warning animate-pulse",
  error: "bg-destructive",
  closed: "bg-muted-foreground",
};

const labels: Record<WsStatus, string> = {
  open: "Tempo real",
  connecting: "Conectando…",
  error: "Erro na conexão",
  closed: "Desconectado",
};

/**
 * Small dot + label that reflects WebSocket connection status.
 * Renders nothing when status is "open" (stable) to avoid visual noise.
 * Show explicitly by passing `alwaysVisible`.
 */
export function WsIndicator({ status, className }: WsIndicatorProps) {
  if (status === "open") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", dotClasses[status])} />
      {labels[status]}
    </span>
  );
}
