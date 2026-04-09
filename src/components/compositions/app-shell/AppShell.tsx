"use client";

import * as React from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  CreditCard,
  ShoppingBag,
  BookOpen,
  LayoutList,
  BarChart2,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { PageLayout, PageContent } from "@/components/compositions/page-layout/PageLayout";
import { Sidebar } from "@/components/compositions/sidebar/Sidebar";
import { Avatar } from "@/components/shared/avatar/Avatar";
import { cn } from "@/lib/cn";
import type { NavSection } from "@/components/compositions/sidebar/Sidebar";

const adminSections: NavSection[] = [
  {
    title: "Admin",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Restaurantes", href: "/admin/restaurants", icon: UtensilsCrossed },
      { label: "Usuários", href: "/admin/users", icon: Users },
      { label: "Financeiro", href: "/admin/finance", icon: CreditCard },
    ],
  },
  {
    title: "Restaurante",
    items: [
      { label: "Dashboard", href: "/restaurant", icon: LayoutDashboard, exact: true },
      { label: "Pedidos", href: "/restaurant/orders", icon: ShoppingBag },
      { label: "Cardápio", href: "/restaurant/menu", icon: BookOpen },
      { label: "Mesas", href: "/restaurant/tables", icon: LayoutList },
      { label: "Financeiro", href: "/restaurant/finance", icon: CreditCard },
      { label: "Relatórios", href: "/restaurant/reports", icon: BarChart2 },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configurações", href: "/settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <PageLayout
      sidebar={
        <div className="relative h-full">
          <Sidebar
            sections={adminSections}
            collapsed={collapsed}
            logo={
              collapsed ? (
                <span className="text-white font-bold text-lg">J</span>
              ) : (
                <span className="text-white font-bold text-lg tracking-tight">
                  Juntai
                </span>
              )
            }
            footer={
              <div
                className={cn(
                  "flex items-center gap-2 p-2",
                  collapsed && "justify-center",
                )}
              >
                <Avatar fallback="JP" size="sm" />
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-sidebar-fg-active truncate">
                      João Paulo
                    </span>
                    <span className="text-[10px] text-sidebar-fg truncate">
                      admin@juntai.com
                    </span>
                  </div>
                )}
              </div>
            }
          />

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "absolute -right-3 top-[calc(var(--header-height)-12px)]",
              "flex h-6 w-6 items-center justify-center rounded-full",
              "border border-border bg-surface shadow-sm text-muted-foreground",
              "hover:text-foreground transition-colors z-10",
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <ChevronLeft
              size={12}
              className={cn(
                "transition-transform duration-[var(--duration-slow)]",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>
      }
    >
      <PageContent>{children}</PageContent>
    </PageLayout>
  );
}
