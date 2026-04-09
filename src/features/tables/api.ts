import { apiClient } from "@/lib/api";
import type { Table } from "./types";

export function listTables(
  restaurantId: string,
  locationId: string,
  token: string | null,
) {
  return apiClient(token).get<Table[]>(
    `/restaurants/${restaurantId}/locations/${locationId}/tables`,
  );
}
