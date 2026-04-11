import type { Membership } from "@/types/auth";

export type PortalProfile =
  | "platform-admin"
  | "owner"
  | "operator"
  | "basic-user";

export function resolvePortalProfile(
  memberships: Membership[],
  contextType: "platform" | "restaurant" = "platform",
  restaurantId?: string,
): PortalProfile {
  const isPlatformAdmin = memberships.some(
    (m) => m.entityType === "platform" && m.role === "admin",
  );

  if (isPlatformAdmin) {
    return contextType === "restaurant" ? "owner" : "platform-admin";
  }

  if (contextType === "restaurant") {
    // Scope ownership check to the active restaurant when we have its id
    const isOwner = restaurantId
      ? memberships.some(
          (m) =>
            m.entityType === "restaurant" &&
            m.entityId === restaurantId &&
            m.role === "owner",
        )
      : memberships.some(
          (m) => m.entityType === "restaurant" && m.role === "owner",
        );

    if (isOwner) return "owner";

    // Location-level operators: the context is already scoped to an accessible
    // restaurant, so any manager/waiter membership is relevant here
    const isOperator = memberships.some(
      (m) => m.role === "manager" || m.role === "waiter",
    );
    if (isOperator) return "operator";

    return "basic-user";
  }

  // Platform context — any ownership across any restaurant counts
  const isOwner = memberships.some(
    (m) => m.entityType === "restaurant" && m.role === "owner",
  );
  const isOperator = memberships.some(
    (m) => m.role === "manager" || m.role === "waiter",
  );

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
