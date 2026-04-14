"use client";

import * as React from "react";
import { Clock, CreditCard, ShoppingBag, Users } from "lucide-react";
import { Avatar } from "@/components/shared/avatar/Avatar";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import { cn } from "@/lib/cn";
import { useSessionChannel } from "@/hooks/useSessionChannel";
import { useSessionMembers, useTableSession } from "@/features/tables/hooks";
import { type WsStatus } from "@/hooks/useWebSocket";
import type { RealtimeEnvelope } from "@juntai/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function elapsed(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`;
}

// ── WS status indicator ───────────────────────────────────────────────────────

const wsStatusConfig: Record<
  WsStatus,
  { dot: string; text: string; label: string }
> = {
  open: { dot: "bg-success", text: "text-success", label: "OPEN" },
  connecting: {
    dot: "bg-warning animate-pulse",
    text: "text-warning",
    label: "CONNECTING",
  },
  error: { dot: "bg-destructive", text: "text-destructive", label: "ERROR" },
  closed: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    label: "CLOSED",
  },
};

function WsStatusDot({ status }: { status: WsStatus }) {
  const cfg = wsStatusConfig[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5">
      <span className={cn("size-1.5 rounded-full shrink-0", cfg.dot)} />
      <Text variant="xs" className={cn("font-mono font-medium", cfg.text)}>
        {cfg.label}
      </Text>
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface GuestSessionViewProps {
  sessionId: string;
  token: string;
  /** Display name of the simulated guest (used to highlight "you" in the member list). */
  displayName: string;
  /** Optional label of the table, shown in the header. */
  tableLabel?: string;
  /** Callback invoked for every WS event (e.g. to feed an event log). */
  onEvent?: (envelope: RealtimeEnvelope) => void;
}

/**
 * Faithful representation of what a guest sees after joining a session.
 * Subscribes to `/ws/session/:sessionId` and reflects live member state.
 * Designed to be used both in the admin dev tool and as the real guest route component.
 */
export function GuestSessionView({
  sessionId,
  token,
  displayName,
  tableLabel,
  onEvent,
}: GuestSessionViewProps) {
  const { status } = useSessionChannel({ sessionId, token, onEvent });
  const { data: session } = useTableSession(sessionId);
  const { data: members = [] } = useSessionMembers(sessionId);

  const isOpen = session?.status === "OPEN";
  const activeCount = members.filter((m) => !m.leftAt).length;

  return (
    <div className="rounded-xl border-2 border-border bg-background flex flex-col overflow-hidden">
      {/* Header — simulates phone top bar */}
      <div className="bg-surface border-b border-border px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Text variant="sm" className="font-semibold truncate">
            {displayName}
          </Text>
          {tableLabel && (
            <Text variant="xs" muted className="shrink-0">
              · {tableLabel}
            </Text>
          )}
        </div>
        <WsStatusDot status={status} />
      </div>

      {/* Session status bar */}
      <div className="px-3 pt-3 pb-1 flex items-center gap-2 flex-wrap">
        {session ? (
          <>
            <Badge variant={isOpen ? "success" : "secondary"} dot>
              {isOpen ? "Sessão aberta" : "Encerrada"}
            </Badge>
            {isOpen && (
              <Text variant="xs" muted className="flex items-center gap-1">
                <Clock size={11} />
                {elapsed(session.openedAt)}
              </Text>
            )}
            <Text
              variant="xs"
              muted
              className="ml-auto flex items-center gap-1"
            >
              <Users size={11} />
              {activeCount}
            </Text>
          </>
        ) : (
          <Text variant="xs" muted>
            Carregando sessão…
          </Text>
        )}
      </div>

      {/* Member list */}
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {members.length === 0 ? (
          <Text variant="xs" muted className="italic">
            Nenhum membro ainda.
          </Text>
        ) : (
          members.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <Avatar
                fallback={m.displayName.slice(0, 2).toUpperCase()}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <Text
                  variant="xs"
                  className={cn(
                    "truncate",
                    m.leftAt && "line-through text-muted-foreground",
                  )}
                >
                  {m.displayName}
                  {m.displayName === displayName && (
                    <span className="ml-1 text-muted-foreground font-normal">
                      (você)
                    </span>
                  )}
                </Text>
              </div>
              {m.leftAt ? (
                <Badge variant="secondary" className="text-xs shrink-0">
                  Saiu
                </Badge>
              ) : (
                <Text variant="xs" muted className="shrink-0 tabular-nums">
                  {elapsed(m.joinedAt)}
                </Text>
              )}
            </div>
          ))
        )}
      </div>

      {/* Future sections — placeholder */}
      <div className="mx-3 mb-3 mt-1 flex gap-2">
        <div className="flex-1 rounded-lg border border-dashed border-border px-2.5 py-2 flex items-center gap-1.5 text-muted-foreground">
          <ShoppingBag size={12} />
          <Text variant="xs" muted>
            Pedidos
          </Text>
        </div>
        <div className="flex-1 rounded-lg border border-dashed border-border px-2.5 py-2 flex items-center gap-1.5 text-muted-foreground">
          <CreditCard size={12} />
          <Text variant="xs" muted>
            Pagamento
          </Text>
        </div>
      </div>
    </div>
  );
}
