import type { Membership } from "@/types/auth";

export type PortalProfile =
  | "platform-admin"
  | "owner"
  | "operator"
  | "basic-user";

export function resolvePortalProfile(memberships: Membership[]): PortalProfile {
  if (
    memberships.some(
      (membership) =>
        membership.entityType === "platform" && membership.role === "admin",
    )
  ) {
    return "platform-admin";
  }

  if (memberships.some((membership) => membership.role === "owner")) {
    return "owner";
  }

  if (
    memberships.some(
      (membership) =>
        membership.role === "manager" || membership.role === "waiter",
    )
  ) {
    return "operator";
  }

  return "basic-user";
}

export function getPortalProfileLabel(profile: PortalProfile) {
  switch (profile) {
    case "platform-admin":
      return "Admin";
    case "owner":
      return "Owner";
    case "operator":
      return "Operação";
    default:
      return "Usuário";
  }
}
