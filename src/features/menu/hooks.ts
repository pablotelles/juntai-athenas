import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { getMenu } from "./api";

export function useMenu(restaurantId: string, locationId: string | null) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["menu", restaurantId, locationId],
    queryFn: () => getMenu(restaurantId, locationId!, sessionToken),
    enabled: !!restaurantId && !!locationId,
  });
}
