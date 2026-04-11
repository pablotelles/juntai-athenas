"use client";

import * as React from "react";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { apiClient } from "@/lib/api";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type ActiveContextValue =
  | { type: "platform" }
  | { type: "restaurant"; restaurantId: string; locationId?: string | null };

export interface RestaurantOption {
  id: string;
  name: string;
}

export interface ActiveContextState {
  context: ActiveContextValue;
  setContext: (ctx: ActiveContextValue) => void;
  /** Persists locationId within the current restaurant context */
  setLocationId: (locationId: string | null) => void;
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

  const hasPlatformAdminAccess = React.useMemo(
    () =>
      memberships.some(
        (membership) =>
          membership.entityType === "platform" && membership.role === "admin",
      ),
    [memberships],
  );

  // Single request — the backend scopes the list to the authenticated actor
  React.useEffect(() => {
    if (!sessionToken) {
      setRestaurants([]);
      setRestaurantsLoading(false);
      return;
    }

    setRestaurantsLoading(true);

    apiClient(sessionToken)
      .get<Array<{ id: string; name: string }>>("/my/restaurants")
      .then((list) => {
        setRestaurants(list);
        setContextState((prev) => {
          const canKeepRestaurantContext =
            prev.type === "restaurant" &&
            list.some((restaurant) => restaurant.id === prev.restaurantId);

          if (canKeepRestaurantContext) return prev;

          const fallback: ActiveContextValue =
            !hasPlatformAdminAccess && list.length > 0
              ? { type: "restaurant", restaurantId: list[0].id }
              : { type: "platform" };

          writeStorage(fallback);
          return fallback;
        });
      })
      .catch(() => {
        setRestaurants([]);
      })
      .finally(() => setRestaurantsLoading(false));
  }, [hasPlatformAdminAccess, sessionToken]);

  // Clear restaurants when the user logs out
  React.useEffect(() => {
    if (!sessionToken) setRestaurants([]);
  }, [sessionToken]);

  const setContext = React.useCallback((ctx: ActiveContextValue) => {
    setContextState(ctx);
    writeStorage(ctx);
  }, []);

  const setLocationId = React.useCallback((locationId: string | null) => {
    setContextState((prev) => {
      if (prev.type !== "restaurant") return prev;
      const next: ActiveContextValue = { ...prev, locationId };
      writeStorage(next);
      return next;
    });
  }, []);

  const value: ActiveContextState = React.useMemo(
    () => ({
      context,
      setContext,
      setLocationId,
      restaurants,
      restaurantsLoading,
      isPlatform: context.type === "platform",
      isRestaurant: context.type === "restaurant",
    }),
    [context, setContext, setLocationId, restaurants, restaurantsLoading],
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
