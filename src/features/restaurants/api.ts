import { createJuntaiClient } from "@juntai/types";
import type {
  Restaurant,
  Location,
  CreateRestaurantBody,
  CreateLocationBody,
} from "@juntai/types";

export type {
  Restaurant,
  Location,
  CreateRestaurantBody,
  CreateLocationBody,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function listRestaurants(token: string | null) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.list();
}

export function createRestaurant(
  body: CreateRestaurantBody,
  token: string | null,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.create(
    body,
  );
}

export function getRestaurant(restaurantId: string, token: string | null) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.get(
    restaurantId,
  );
}

export function createLocation(
  restaurantId: string,
  body: CreateLocationBody,
  token: string | null,
) {
  return createJuntaiClient({
    baseUrl: BASE_URL,
    token,
  }).restaurants.createLocation(restaurantId, body);
}

export function getLocations(restaurantId: string, token: string | null) {
  return createJuntaiClient({
    baseUrl: BASE_URL,
    token,
  }).restaurants.listLocations(restaurantId);
}
