import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateLocationBody, CreateRestaurantBody } from "./api";
import { useAuth } from "@/contexts/auth/AuthProvider";
import {
  createLocation,
  createRestaurant,
  listRestaurants,
  getLocations,
} from "./api";

export function useAllRestaurants() {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: () => listRestaurants(sessionToken),
    staleTime: 5 * 60_000,
  });
}

export function useLocations(restaurantId: string) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["locations", restaurantId],
    queryFn: () => getLocations(restaurantId, sessionToken),
    enabled: !!restaurantId,
    staleTime: 5 * 60_000,
  });
}

export function useCreateRestaurant() {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRestaurantBody) =>
      createRestaurant(body, sessionToken),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useCreateLocation(restaurantId: string) {
  const { sessionToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateLocationBody) =>
      createLocation(restaurantId, body, sessionToken),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
        queryClient.invalidateQueries({ queryKey: ["locations", restaurantId] }),
      ]);
    },
  });
}
