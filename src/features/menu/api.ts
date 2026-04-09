import { apiClient } from "@/lib/api";
import type { MenuWithCategories } from "./types";

export function getMenu(
  restaurantId: string,
  locationId: string,
  token: string | null,
) {
  return apiClient(token).get<MenuWithCategories[]>(
    `/restaurants/${restaurantId}/locations/${locationId}/menu`,
  );
}
