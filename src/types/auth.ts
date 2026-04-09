// Roles do BE (actor roles)
export type UserRole =
  | "PLATFORM_ADMIN"
  | "OWNER"
  | "MANAGER"
  | "WAITER"
  | "SESSION_USER"
  | "AUTHENTICATED"
  | "GUEST";

// Tipos de entidade para memberships
export type EntityType = "platform" | "restaurant" | "location";

// Papel dentro de uma membership
export type MembershipRole = "admin" | "owner" | "manager" | "waiter";

export interface AuthUser {
  id: string;
  type: "guest" | "user";
  name: string | null;
  email: string | null;
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  entityType: EntityType;
  entityId: string;
  role: MembershipRole;
}

export interface AuthState {
  user: AuthUser | null;
  sessionToken: string | null;
  memberships: Membership[];
}
