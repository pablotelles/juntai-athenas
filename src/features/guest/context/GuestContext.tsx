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
}: {
  children: React.ReactNode;
  sessionId: string;
}) {
  const [token, setToken] = React.useState<string | null>(null);
  const [memberId, setMemberId] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  const [isRestoring, setIsRestoring] = React.useState(true);

  // Restore from localStorage on mount (skip SSR)
  React.useEffect(() => {
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
  }, [sessionId]);

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
