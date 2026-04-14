// ─────────────────────────────────────────────────────────────
// NAVIGATION CONFIG
// Single source of truth for all nav items.
// The sidebar renders items filtered by the active context.
// ─────────────────────────────────────────────────────────────

import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  BookOpen,
  LayoutList,
  CreditCard,
  BarChart2,
  Settings,
  Users,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import type { PortalProfile } from "@/lib/access";

export type ContextType = "platform" | "restaurant";

export interface NavConfigItem {
  /** Display label */
  label: string;
  /** Absolute href */
  href: string;
  /** Lucide icon */
  icon: LucideIcon;
  /** Which context types this item appears in */
  contexts: ContextType[];
  /** Which portal profiles can see the item */
  profiles?: PortalProfile[];
  /** Use exact pathname match for active state */
  exact?: boolean;
  /** Optional badge (count, label) */
  badge?: string | number;
}

export const NAV_ITEMS: NavConfigItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    contexts: ["platform", "restaurant"],
    profiles: ["platform-admin", "owner", "operator", "basic-user"],
    exact: true,
  },
  {
    label: "Restaurantes",
    href: "/restaurants",
    icon: UtensilsCrossed,
    contexts: ["platform"],
    profiles: ["platform-admin", "owner", "operator"],
  },
  {
    label: "Usuários",
    href: "/users",
    icon: Users,
    contexts: ["platform", "restaurant"],
    profiles: ["platform-admin", "owner", "operator"],
  },
  {
    label: "Pedidos",
    href: "/orders",
    icon: ShoppingBag,
    contexts: ["restaurant"],
    profiles: ["owner", "operator"],
  },
  {
    label: "Cardápio",
    href: "/menu",
    icon: BookOpen,
    contexts: ["restaurant"],
    profiles: ["owner", "operator"],
  },
  {
    label: "Mesas",
    href: "/tables",
    icon: LayoutList,
    contexts: ["restaurant"],
    profiles: ["owner", "operator"],
  },
  {
    label: "Financeiro",
    href: "/finance",
    icon: CreditCard,
    contexts: ["platform", "restaurant"],
    profiles: ["platform-admin", "owner", "operator"],
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart2,
    contexts: ["platform", "restaurant"],
    profiles: ["platform-admin", "owner", "operator"],
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    contexts: ["platform", "restaurant"],
    profiles: ["platform-admin", "owner", "operator"],
  },
  {
    label: "Admin",
    href: "/admin",
    icon: FlaskConical,
    contexts: ["platform"],
    profiles: ["platform-admin"],
    exact: true,
  },
];
