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
  type LucideIcon,
} from "lucide-react";

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
    exact: true,
  },
  {
    label: "Restaurantes",
    href: "/restaurants",
    icon: UtensilsCrossed,
    contexts: ["platform"],
  },
  {
    label: "Usuários",
    href: "/users",
    icon: Users,
    contexts: ["platform", "restaurant"],
  },
  {
    label: "Pedidos",
    href: "/orders",
    icon: ShoppingBag,
    contexts: ["restaurant"],
  },
  {
    label: "Cardápio",
    href: "/menu",
    icon: BookOpen,
    contexts: ["restaurant"],
  },
  {
    label: "Mesas",
    href: "/tables",
    icon: LayoutList,
    contexts: ["restaurant"],
  },
  {
    label: "Financeiro",
    href: "/finance",
    icon: CreditCard,
    contexts: ["platform", "restaurant"],
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart2,
    contexts: ["platform", "restaurant"],
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    contexts: ["platform", "restaurant"],
  },
];
