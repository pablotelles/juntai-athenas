import { apiClient } from "@/lib/api";
import type { Restaurant, Location } from "./types";

export function listRestaurants(token: string | null) {
  return apiClient(token).get<Restaurant[]>("/restaurants");
}

export function getLocations(restaurantId: string, token: string | null) {
  return apiClient(token).get<Location[]>(
    `/restaurants/${restaurantId}/locations`,
  );
}
