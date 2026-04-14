"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  GuestProvider,
  useGuest,
} from "@/features/guest/context/GuestContext";
import { GuestOnboarding } from "@/features/guest/components/GuestOnboarding";
import { MenuBrowser } from "@/features/guest/components/MenuBrowser";
import { CartProvider } from "@/features/guest/components/CartProvider";
import { CartButton } from "@/features/guest/components/CartButton";
import { CartDrawer } from "@/features/guest/components/CartDrawer";
import { useSessionChannel } from "@/hooks/useSessionChannel";
import { useTableSession } from "@/features/tables/hooks";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import { type WsStatus } from "@/hooks/useWebSocket";
import { cn } from "@/lib/cn";

// ── WS Status dot (inline, minimal) ──────────────────────────────────────────

const wsColors: Record<WsStatus, string> = {
  open: "bg-success",
  connecting: "bg-warning animate-pulse",
  error: "bg-destructive",
  closed: "bg-muted-foreground",
};

function WsDot({ status }: { status: WsStatus }) {
  return (
    <span className={cn("inline-block size-2 rounded-full", wsColors[status])} />
  );
}

// ── Session header bar ────────────────────────────────────────────────────────

function SessionHeader() {
  const { sessionId, token } = useGuest();
  const { status } = useSessionChannel({ sessionId, token: token! });
  const { data: session } = useTableSession(sessionId);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface shrink-0">
      <Text variant="sm" className="font-semibold">
        {session ? "Mesa" : "Carregando…"}
      </Text>
      <div className="flex items-center gap-2">
        {session && (
          <Badge
            variant={session.status === "OPEN" ? "success" : "secondary"}
            dot
          >
            {session.status === "OPEN" ? "Aberta" : "Encerrada"}
          </Badge>
        )}
        <WsDot status={status} />
      </div>
    </div>
  );
}

// ── Main guest view (after joining) ──────────────────────────────────────────

function GuestMainView() {
  const [cartOpen, setCartOpen] = React.useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <SessionHeader />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <MenuBrowser />
        {/* Spacer so CartButton doesn't overlap last item */}
        <div className="h-20 shrink-0" />
      </div>
      <CartButton onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

// ── Inner component (needs GuestContext) ──────────────────────────────────────

function GuestAppInner() {
  const { token, displayName, isRestoring } = useGuest();

  if (isRestoring) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!token || !displayName) {
    return <GuestOnboarding />;
  }

  return (
    <CartProvider>
      <GuestMainView />
    </CartProvider>
  );
}

// ── Root — provides QueryClient + GuestContext ─────────────────────────────────

export function GuestSessionApp({ sessionId }: { sessionId: string }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GuestProvider sessionId={sessionId}>
        <GuestAppInner />
      </GuestProvider>
    </QueryClientProvider>
  );
}
