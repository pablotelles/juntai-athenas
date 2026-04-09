export type UserType = "guest" | "user";

export type UserRole = "admin" | "owner" | "staff";

export type EntityType = "platform" | "group" | "restaurant";

export interface AuthUser {
  id: string;
  type: UserType;
  name?: string;
  email?: string;
}

export interface Membership {
  entityType: EntityType;
  entityId: string;
  role: UserRole;
}

export interface AuthState {
  user: AuthUser | null;
  sessionToken: string | null;
  memberships: Membership[];
}
