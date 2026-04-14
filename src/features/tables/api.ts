import { createJuntaiClient } from "@juntai/types";
import { apiClient } from "@/lib/api";
import type { Order } from "@juntai/types";
import type {
  AddMemberBody,
  CreateTableBody,
  GuestJoinBody,
  GuestJoinResult,
  Table,
  TableSession,
  TableSessionMember,
  UpdateTableBody,
} from "@juntai/types";

export type {
  AddMemberBody,
  GuestJoinBody,
  GuestJoinResult,
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

export function getTableSessionById(sessionId: string, token: string | null) {
  return getTablesClient(token).getSessionById(sessionId);
}

export function listTableSessionMembers(
  sessionId: string,
  token: string | null,
) {
  return getTablesClient(token).listMembers(sessionId);
}

export function addSessionMember(
  sessionId: string,
  userId: string,
  displayName: string,
  token: string | null,
) {
  return getTablesClient(token).addMember(sessionId, { userId, displayName });
}

export function guestJoinSession(
  sessionId: string,
  email: string,
  displayName: string,
  token: string | null,
): Promise<GuestJoinResult> {
  return getTablesClient(token).guestJoin(sessionId, { email, displayName });
}

export function closeTableSession(
  sessionId: string,
  restaurantId: string,
  token: string | null,
) {
  return getTablesClient(token).closeSession(sessionId, restaurantId);
}

// ── Staff session order management ───────────────────────────────────────────

export interface StaffOrderItem {
  menuItemId: string;
  quantity: number;
  selectedModifiers: Array<{ groupId: string; optionId: string }>;
  notes?: string;
}

export interface CreateStaffOrderBody {
  items: StaffOrderItem[];
  notes?: string;
}

/** List orders for a session — staff token, no x-table-session-id required. */
export function listStaffSessionOrders(
  sessionId: string,
  token: string | null,
): Promise<Order[]> {
  return apiClient(token).get<Order[]>(`/sessions/${sessionId}/orders`);
}

/** Create an order for a session as staff (manual launch). */
export function createStaffOrder(
  sessionId: string,
  body: CreateStaffOrderBody,
  token: string | null,
): Promise<Order> {
  return apiClient(token).post<Order>(`/sessions/${sessionId}/orders`, body);
}

/** Staff removes a specific member from a session. */
export function removeSessionMember(
  sessionId: string,
  memberId: string,
  token: string | null,
): Promise<void> {
  return apiClient(token).delete<void>(
    `/sessions/${sessionId}/members/${memberId}`,
  );
}
