import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateLocationBody, CreateRestaurantBody } from "./api";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import {
  createLocation,
  createRestaurant,
  listRestaurants,
  getLocations,
} from "./api";

function useRestaurantContextHeaders(targetRestaurantId?: string) {
  const { context } = useActiveContext();
  const { memberships } = useAuth();

  if (context.type === "restaurant") {
    return {
      restaurantId: context.restaurantId,
      ...(context.locationId ? { locationId: context.locationId } : {}),
    };
  }

  const fallbackRestaurantId =
    targetRestaurantId ??
    memberships.find(
      (membership) =>
        membership.entityType === "restaurant" && membership.role === "owner",
    )?.entityId;

  return fallbackRestaurantId ? { restaurantId: fallbackRestaurantId } : {};
}

export function useAllRestaurants() {
  const { sessionToken } = useAuth();
  const ctx = useRestaurantContextHeaders();
  return useQuery({
    queryKey: ["restaurants", ctx],
    queryFn: () => listRestaurants(sessionToken, ctx),
    staleTime: 5 * 60_000,
  });
}

export function useLocations(restaurantId: string) {
  const { sessionToken } = useAuth();
  const ctx = useRestaurantContextHeaders(restaurantId);
  return useQuery({
    queryKey: ["locations", restaurantId, ctx],
    queryFn: () => getLocations(restaurantId, sessionToken, ctx),
    enabled: !!restaurantId,
    staleTime: 5 * 60_000,
  });
}

export function useCreateRestaurant() {
  const { sessionToken } = useAuth();
  const ctx = useRestaurantContextHeaders();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRestaurantBody) =>
      createRestaurant(body, sessionToken, ctx),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useCreateLocation(restaurantId: string) {
  const { sessionToken } = useAuth();
  const ctx = useRestaurantContextHeaders(restaurantId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateLocationBody) =>
      createLocation(restaurantId, body, sessionToken, ctx),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
        queryClient.invalidateQueries({
          queryKey: ["locations", restaurantId],
        }),
      ]);
    },
  });
}
