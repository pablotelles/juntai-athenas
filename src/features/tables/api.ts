import { createJuntaiClient } from "@juntai/types";
import type { Table, TableSession, TableSessionMember } from "@juntai/types";
import { apiClient } from "@/lib/api";

export type { Table, TableSession, TableSessionMember };

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

export function getOrCreateTableSession(qrToken: string, token: string | null) {
  return apiClient(token).get<TableSession>(`/tables/${qrToken}/session`);
}

export function joinTableSession(
  sessionId: string,
  displayName: string,
  token: string | null,
) {
  return apiClient(token).post<TableSessionMember>(`/sessions/${sessionId}/join`, {
    displayName,
  });
}

export function closeTableSession(
  sessionId: string,
  restaurantId: string,
  token: string | null,
) {
  return apiClient(token).delete<void>(
    `/sessions/${sessionId}?restaurantId=${restaurantId}`,
  );
}
