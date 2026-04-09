export type UserRole = "admin" | "owner" | "staff";

export type EntityType = "platform" | "group" | "restaurant";

export interface AuthUser {
  id: string;
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
