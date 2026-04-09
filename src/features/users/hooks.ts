import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { listUsers, type ListUsersParams } from "./api";

export function useUsers(params: ListUsersParams = {}) {
  const { sessionToken } = useAuth();
  const { context } = useActiveContext();

  // Send context headers so the BE auth hook can resolve the right actor
  // OWNER (restaurant-level) → X-Restaurant-Id
  // MANAGER (location-level) → X-Restaurant-Id + X-Location-Id (when locationId is available)
  const ctx =
    context.type === "restaurant"
      ? {
          restaurantId: context.restaurantId,
          ...(("locationId" in context && context.locationId)
            ? { locationId: (context as { locationId: string }).locationId }
            : {}),
        }
      : {};

  return useQuery({
    queryKey: ["users", params, context],
    queryFn: () => listUsers(sessionToken, params, ctx),
  });
}
