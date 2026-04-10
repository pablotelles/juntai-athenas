import type {
  User,
  Membership,
  MembershipRole,
  MembershipEntityType,
  UserRole,
} from "@juntai/types";

// Re-exportados de @juntai/types — fonte canônica
export type {
  User,
  Membership,
  MembershipRole,
  MembershipEntityType,
  UserRole,
};

// Aliases de compatibilidade — preferir os nomes acima em código novo
export type AuthUser = User;
export type EntityType = MembershipEntityType;

// Athenas-specific: estado da sessão no cliente
export interface AuthState {
  user: User | null;
  sessionToken: string | null;
  memberships: Membership[];
}
