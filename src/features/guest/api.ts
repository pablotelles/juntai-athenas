import { apiClient } from "@/lib/api";
import type { MenuWithCategories, Order } from "@juntai/types";

/** Extra headers needed for SESSION_USER authentication. */
function sessionHeaders(sessionId: string): Record<string, string> {
  return { "x-table-session-id": sessionId };
}

export function fetchGuestMenu(
  token: string,
  sessionId: string,
): Promise<MenuWithCategories[]> {
  return apiClient(token).get<MenuWithCategories[]>(
    `/sessions/${sessionId}/menu`,
    sessionHeaders(sessionId),
  );
}

// ── Orders ────────────────────────────────────────────────────────────────────

export interface GuestSelectedModifier {
  groupId: string;
  optionId: string;
  quantity?: number;
}

export interface GuestOrderItem {
  menuItemId: string;
  quantity: number;
  selectedModifiers: GuestSelectedModifier[];
  notes?: string;
}

export interface CreateGuestOrderBody {
  items: GuestOrderItem[];
  notes?: string;
}

export function createGuestOrder(
  token: string,
  sessionId: string,
  body: CreateGuestOrderBody,
): Promise<Order> {
  return apiClient(token).post<Order>(
    `/sessions/${sessionId}/orders`,
    body,
    sessionHeaders(sessionId),
  );
}

export function fetchSessionOrders(
  token: string,
  sessionId: string,
): Promise<Order[]> {
  return apiClient(token).get<Order[]>(
    `/sessions/${sessionId}/orders`,
    sessionHeaders(sessionId),
  );
}
