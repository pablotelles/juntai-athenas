export type MembershipRole = "admin" | "owner" | "manager" | "waiter";
export type MembershipEntityType = "platform" | "restaurant" | "location";

export interface Membership {
  id: string;
  userId: string;
  entityType: MembershipEntityType;
  entityId: string;
  role: MembershipRole;
}

export interface User {
  id: string;
  type: "guest" | "user";
  name: string | null;
  email: string | null;
  createdAt: string;
}

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
