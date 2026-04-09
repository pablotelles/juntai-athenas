import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { listTables } from "./api";

export function useTables(restaurantId: string, locationId: string | null) {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["tables", restaurantId, locationId],
    queryFn: () => listTables(restaurantId, locationId!, sessionToken),
    enabled: !!restaurantId && !!locationId,
  });
}
