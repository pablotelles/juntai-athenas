import type {
  User,
  Membership,
  MembershipRole,
  MembershipEntityType,
} from "@juntai/types";

// Re-exportados de @juntai/types — fonte canônica
export type { User, Membership, MembershipRole, MembershipEntityType };

// Athenas-specific
export interface UserWithMemberships extends User {
  memberships: Membership[];
}

export interface UsersPage {
  data: UserWithMemberships[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
