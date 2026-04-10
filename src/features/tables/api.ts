import { createJuntaiClient } from "@juntai/types";
import type {
  CreateTableBody,
  Table,
  TableSession,
  TableSessionMember,
  UpdateTableBody,
} from "@juntai/types";

export type {
  Table,
  TableSession,
  TableSessionMember,
  CreateTableBody,
  UpdateTableBody,
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function getTablesClient(token: string | null) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).tables;
}

export function listTables(
  restaurantId: string,
  locationId: string,
  token: string | null,
) {
  return getTablesClient(token).list(restaurantId, locationId);
}

export function createTable(
  restaurantId: string,
  locationId: string,
  body: CreateTableBody,
  token: string | null,
) {
  return getTablesClient(token).create(restaurantId, locationId, body);
}

export function updateTable(
  restaurantId: string,
  locationId: string,
  tableId: string,
  body: UpdateTableBody,
  token: string | null,
) {
  return getTablesClient(token).update(restaurantId, locationId, tableId, body);
}

export function deleteTable(
  restaurantId: string,
  locationId: string,
  tableId: string,
  token: string | null,
) {
  return getTablesClient(token).delete(restaurantId, locationId, tableId);
}

export function getOrCreateTableSession(qrToken: string, token: string | null) {
  return getTablesClient(token).getSession(qrToken);
}

export function joinTableSession(
  sessionId: string,
  displayName: string,
  token: string | null,
) {
  return getTablesClient(token).joinSession(sessionId, { displayName });
}

export function closeTableSession(
  sessionId: string,
  restaurantId: string,
  token: string | null,
) {
  return getTablesClient(token).closeSession(sessionId, restaurantId);
}
