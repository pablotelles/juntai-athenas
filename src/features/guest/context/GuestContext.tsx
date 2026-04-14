"use client";

import * as React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GuestState {
  sessionId: string;
  /** Auth token returned by POST /sessions/:sessionId/guest-join */
  token: string | null;
  memberId: string | null;
  displayName: string | null;
  /** True while restoring state from localStorage (prevents flashing onboarding) */
  isRestoring: boolean;
  /** Call after a successful guest-join to persist the session state. */
  join: (token: string, memberId: string, displayName: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const GuestContext = React.createContext<GuestState | null>(null);

function storageKey(sessionId: string) {
  return `juntai:guest-session:${sessionId}`;
}

export function GuestProvider({
  children,
  sessionId,
  initialToken,
  initialMemberId,
  initialDisplayName,
}: {
  children: React.ReactNode;
  sessionId: string;
  /** When provided, skip localStorage restore and use these values directly (e.g. admin simulation). */
  initialToken?: string;
  initialMemberId?: string;
  initialDisplayName?: string;
}) {
  const [token, setToken] = React.useState<string | null>(initialToken ?? null);
  const [memberId, setMemberId] = React.useState<string | null>(
    initialMemberId ?? null,
  );
  const [displayName, setDisplayName] = React.useState<string | null>(
    initialDisplayName ?? null,
  );
  const [isRestoring, setIsRestoring] = React.useState(!initialToken);

  // Restore from localStorage on mount (skip if initialToken was provided)
  React.useEffect(() => {
    if (initialToken) return; // already initialized from props
    try {
      const raw = localStorage.getItem(storageKey(sessionId));
      if (raw) {
        const data = JSON.parse(raw) as {
          token: string;
          memberId: string;
          displayName: string;
        };
        setToken(data.token);
        setMemberId(data.memberId);
        setDisplayName(data.displayName);
      }
    } catch {
      // ignore
    } finally {
      setIsRestoring(false);
    }
  }, [sessionId, initialToken]);

  const join = React.useCallback(
    (newToken: string, newMemberId: string, newDisplayName: string) => {
      setToken(newToken);
      setMemberId(newMemberId);
      setDisplayName(newDisplayName);
      localStorage.setItem(
        storageKey(sessionId),
        JSON.stringify({
          token: newToken,
          memberId: newMemberId,
          displayName: newDisplayName,
        }),
      );
    },
    [sessionId],
  );

  return (
    <GuestContext.Provider
      value={{ sessionId, token, memberId, displayName, isRestoring, join }}
    >
      {children}
    </GuestContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGuest(): GuestState {
  const ctx = React.useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be used inside <GuestProvider>");
  return ctx;
}
