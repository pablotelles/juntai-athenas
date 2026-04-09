"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { PageLayout, PageContent } from "@/components/compositions/page-layout/PageLayout";
import { Sidebar } from "@/components/compositions/sidebar/Sidebar";
import { AppHeader } from "@/components/compositions/app-header/AppHeader";
import { Avatar } from "@/components/shared/avatar/Avatar";
import { cn } from "@/lib/cn";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { NAV_ITEMS } from "@/config/navigation";
import type { NavSection } from "@/components/compositions/sidebar/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { context } = useActiveContext();

  // ── Dynamic nav: filter by active context ──────────────────────────────────
  const filtered = NAV_ITEMS.filter((item) =>
    item.contexts.includes(context.type),
  );

  const mainItems = filtered.filter((i) => i.href !== "/settings");
  const systemItems = filtered.filter((i) => i.href === "/settings");

  const sections: NavSection[] = [
    { items: mainItems },
    ...(systemItems.length > 0
      ? [{ title: "Sistema", items: systemItems }]
      : []),
  ].filter((s) => s.items.length > 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageLayout
      sidebar={
        <div className="relative h-full">
          <Sidebar
            sections={sections}
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
      {/* Global header: breadcrumb | ⌘K | ContextSwitcher | UserMenu */}
      <AppHeader />
      <PageContent>{children}</PageContent>
    </PageLayout>
  );
}
