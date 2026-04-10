import { createJuntaiClient } from "@juntai/types";
import type { MenuWithCategories } from "@juntai/types";

export type { MenuWithCategories };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function getMenu(
  restaurantId: string,
  locationId: string,
  token: string | null,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).menu.get(
    restaurantId,
    locationId,
  );
}
