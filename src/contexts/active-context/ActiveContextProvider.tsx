"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { apiClient } from "@/lib/api";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ActiveContextValue =
  | { type: "platform" }
  | { type: "restaurant"; restaurantId: string };

export interface RestaurantOption {
  id: string;
  name: string;
}

export interface ActiveContextState {
  context: ActiveContextValue;
  setContext: (ctx: ActiveContextValue) => void;
  /** Restaurants accessible to the current user */
  restaurants: RestaurantOption[];
  restaurantsLoading: boolean;
  /** Convenience flags */
  isPlatform: boolean;
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
    if (raw) {
      const parsed = JSON.parse(raw) as { type: string };
      // Drop legacy "group" type from previous mock implementation
      if (parsed.type === "group") return { type: "platform" };
      return parsed as ActiveContextValue;
    }
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
  const { memberships, sessionToken } = useAuth();
  const [context, setContextState] = React.useState<ActiveContextValue>(() =>
    readStorage(),
  );
  const [restaurants, setRestaurants] = React.useState<RestaurantOption[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = React.useState(false);

  // Derive restaurant IDs the user has a membership for
  const restaurantIds = React.useMemo(
    () =>
      memberships
        .filter((m) => m.entityType === "restaurant")
        .map((m) => m.entityId),
    [memberships],
  );

  // Fetch restaurant details from the BE whenever the membership list changes
  React.useEffect(() => {
    if (restaurantIds.length === 0) {
      setRestaurants([]);
      return;
    }

    const client = apiClient(sessionToken);
    setRestaurantsLoading(true);

    Promise.all(
      restaurantIds.map((id) =>
        client.get<{ id: string; name: string }>(`/restaurants/${id}`),
      ),
    )
      .then((results) => {
        const list = results.map((r) => ({ id: r.id, name: r.name }));
        setRestaurants(list);
        // If the stored context references a restaurant no longer accessible, reset to platform
        setContextState((prev) => {
          if (
            prev.type === "restaurant" &&
            !list.some((r) => r.id === prev.restaurantId)
          ) {
            const fallback: ActiveContextValue = { type: "platform" };
            writeStorage(fallback);
            return fallback;
          }
          return prev;
        });
      })
      .catch(() => {
        setRestaurants([]);
      })
      .finally(() => setRestaurantsLoading(false));
  }, [restaurantIds, sessionToken]);

  // Clear restaurants when the user logs out
  React.useEffect(() => {
    if (!sessionToken) setRestaurants([]);
  }, [sessionToken]);

  const setContext = React.useCallback((ctx: ActiveContextValue) => {
    setContextState(ctx);
    writeStorage(ctx);
  }, []);

  const value: ActiveContextState = React.useMemo(
    () => ({
      context,
      setContext,
      restaurants,
      restaurantsLoading,
      isPlatform: context.type === "platform",
      isRestaurant: context.type === "restaurant",
    }),
    [context, setContext, restaurants, restaurantsLoading],
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
