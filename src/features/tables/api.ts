import { createJuntaiClient } from "@juntai/types";
import type { Table } from "@juntai/types";

export type { Table };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function listTables(
  restaurantId: string,
  locationId: string,
  token: string | null,
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).tables.list(
    restaurantId,
    locationId,
  );
}
