import { createJuntaiClient } from "@juntai/types";
import type { MembershipRole } from "@juntai/types";
import type {
  UsersPage,
  ListUsersParams,
  UserContextHeaders,
} from "@juntai/types";

export type { UsersPage, ListUsersParams, UserContextHeaders, MembershipRole };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function listUsers(
  token: string | null,
  params: ListUsersParams = {},
  ctx: UserContextHeaders = {},
) {
  return createJuntaiClient({ baseUrl: BASE_URL, token }).users.list(
    params,
    ctx,
  );
}
