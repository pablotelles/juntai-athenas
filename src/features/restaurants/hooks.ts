import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { listRestaurants, getLocations } from "./api";

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
