import { createJuntaiClient } from "@juntai/types";
import type {
  Restaurant,
  Location,
  CreateRestaurantBody,
  CreateLocationBody,
  RestaurantContextHeaders,
} from "@juntai/types";

export type {
  Restaurant,
  Location,
  CreateRestaurantBody,
  CreateLocationBody,
  RestaurantContextHeaders,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function listRestaurants(
  token: string | null,
  ctx?: RestaurantContextHeaders,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.list(ctx);
}

export function createRestaurant(
  body: CreateRestaurantBody,
  token: string | null,
  ctx?: RestaurantContextHeaders,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.create(
    body,
    ctx,
  );
}

export function getRestaurant(
  restaurantId: string,
  token: string | null,
  ctx?: RestaurantContextHeaders,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).restaurants.get(
    restaurantId,
    ctx,
  );
}

export function createLocation(
  restaurantId: string,
  body: CreateLocationBody,
  token: string | null,
  ctx?: RestaurantContextHeaders,
) {
  return createJuntaiClient({
    baseUrl: BASE_URL,
    token,
  }).restaurants.createLocation(restaurantId, body, ctx);
}

export function getLocations(
  restaurantId: string,
  token: string | null,
  ctx?: RestaurantContextHeaders,
) {
  return createJuntaiClient({
    baseUrl: BASE_URL,
    token,
  }).restaurants.listLocations(restaurantId, ctx);
}
