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
  type LucideIcon,
} from "lucide-react";

export type ContextType = "platform" | "group" | "restaurant";

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
    contexts: ["platform", "group", "restaurant"],
    exact: true,
  },
  {
    label: "Restaurantes",
    href: "/restaurants",
    icon: UtensilsCrossed,
    contexts: ["platform", "group"],
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
    contexts: ["platform", "group", "restaurant"],
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart2,
    contexts: ["platform", "group", "restaurant"],
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
    contexts: ["platform", "group", "restaurant"],
  },
];
