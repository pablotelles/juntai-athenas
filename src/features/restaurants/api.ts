import { createJuntaiClient } from "@juntai/types";
import type { Restaurant, Location } from "@juntai/types";

export type { Restaurant, Location };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function listRestaurants(token: string | null) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.list();
}

export function getRestaurant(restaurantId: string, token: string | null) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.get(
    restaurantId,
  );
}

export function getLocations(restaurantId: string, token: string | null) {
  return createJuntaiClient({
    baseUrl: BASE_URL,
    token,
  }).restaurants.listLocations(restaurantId);
}
