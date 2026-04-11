import type { Membership } from "@/types/auth";

export type PortalProfile =
  | "platform-admin"
  | "owner"
  | "operator"
  | "basic-user";

export function resolvePortalProfile(
  memberships: Membership[],
  contextType: "platform" | "restaurant" = "platform",
): PortalProfile {
  const isPlatformAdmin = memberships.some(
    (membership) =>
      membership.entityType === "platform" && membership.role === "admin",
  );

  const isOwner = memberships.some((membership) => membership.role === "owner");
  const isOperator = memberships.some(
    (membership) =>
      membership.role === "manager" || membership.role === "waiter",
  );

  if (contextType === "restaurant") {
    if (isPlatformAdmin || isOwner) return "owner";
    if (isOperator) return "operator";
    return "basic-user";
  }

  if (isPlatformAdmin) return "platform-admin";
  if (isOwner) return "owner";
  if (isOperator) return "operator";

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
