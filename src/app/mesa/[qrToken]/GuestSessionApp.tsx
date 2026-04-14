"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  GuestProvider,
  useGuest,
} from "@/features/guest/context/GuestContext";
import { GuestOnboarding } from "@/features/guest/components/GuestOnboarding";
import { GuestSessionView } from "@/features/tables/components/GuestSessionView";

// ── Inner component (needs GuestContext) ──────────────────────────────────────

function GuestAppInner() {
  const { sessionId, token, displayName, isRestoring } = useGuest();

  if (isRestoring) {
    // Avoid flashing the onboarding while reading localStorage
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
    <div className="flex h-full flex-col overflow-hidden">
      <GuestSessionView
        sessionId={sessionId}
        token={token}
        displayName={displayName}
      />
    </div>
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
