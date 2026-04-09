import { apiClient } from "@/lib/api";
import type { MembershipRole, UsersPage } from "./types";

export interface ListUsersParams {
  name?: string;
  email?: string;
  role?: MembershipRole;
  page?: number;
  limit?: number;
}

export interface UserContextHeaders {
  restaurantId?: string;
  locationId?: string;
}

export function listUsers(
  token: string | null,
  params: ListUsersParams = {},
  ctx: UserContextHeaders = {},
) {
  const search = new URLSearchParams();
  if (params.name) search.set("name", params.name);
  if (params.email) search.set("email", params.email);
  if (params.role) search.set("role", params.role);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();

  const contextHeaders: Record<string, string> = {};
  if (ctx.restaurantId) contextHeaders["X-Restaurant-Id"] = ctx.restaurantId;
  if (ctx.locationId) contextHeaders["X-Location-Id"] = ctx.locationId;

  return apiClient(token).get<UsersPage>(
    `/users${qs ? `?${qs}` : ""}`,
    Object.keys(contextHeaders).length > 0 ? contextHeaders : undefined,
  );
}
