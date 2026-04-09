"use client";

import * as React from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ActiveContextValue =
  | { type: "platform" }
  | { type: "group"; groupId: string }
  | { type: "restaurant"; restaurantId: string };

export interface ActiveContextState {
  context: ActiveContextValue;
  setContext: (ctx: ActiveContextValue) => void;
  /** Convenience flags */
  isPlatform: boolean;
  isGroup: boolean;
  isRestaurant: boolean;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const ActiveContextCtx = React.createContext<ActiveContextState | null>(null);

// ─────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "juntai_active_context";

function readStorage(): ActiveContextValue {
  if (typeof window === "undefined") return { type: "platform" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ActiveContextValue;
  } catch {
    // silent fail
  }
  return { type: "platform" };
}

function writeStorage(ctx: ActiveContextValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    // silent fail
  }
}

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function ActiveContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContextState] = React.useState<ActiveContextValue>(() =>
    readStorage(),
  );

  const setContext = React.useCallback((ctx: ActiveContextValue) => {
    setContextState(ctx);
    writeStorage(ctx);
  }, []);

  const value: ActiveContextState = React.useMemo(
    () => ({
      context,
      setContext,
      isPlatform: context.type === "platform",
      isGroup: context.type === "group",
      isRestaurant: context.type === "restaurant",
    }),
    [context, setContext],
  );

  return (
    <ActiveContextCtx.Provider value={value}>
      {children}
    </ActiveContextCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useActiveContext(): ActiveContextState {
  const ctx = React.useContext(ActiveContextCtx);
  if (!ctx) {
    throw new Error(
      "useActiveContext must be used inside <ActiveContextProvider>",
    );
  }
  return ctx;
}
