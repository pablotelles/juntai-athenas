"use client";

import * as React from "react";
import { ChevronLeft, X } from "lucide-react";
import {
  PageLayout,
  PageContent,
} from "@/components/compositions/page-layout/PageLayout";
import { Sidebar } from "@/components/compositions/sidebar/Sidebar";
import { AppHeader } from "@/components/compositions/app-header/AppHeader";
import { Avatar } from "@/components/shared/avatar/Avatar";
import { cn } from "@/lib/cn";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NAV_ITEMS } from "@/config/navigation";
import type { NavSection } from "@/components/compositions/sidebar/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { context } = useActiveContext();
  const { user } = useAuth();

  // Close mobile drawer when switching to desktop
  React.useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

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

  const sidebarNode = (
    <Sidebar
      sections={sections}
      collapsed={isMobile ? false : collapsed}
      logo={
        collapsed && !isMobile ? (
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
            collapsed && !isMobile && "justify-center",
          )}
        >
          <Avatar fallback={userInitials} size="sm" />
          {(!collapsed || isMobile) && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-sidebar-fg-active truncate">
                {user?.name ?? "Usuário"}
              </span>
              <span className="text-[10px] text-sidebar-fg truncate">
                {user?.email ?? ""}
              </span>
            </div>
          )}
        </div>
      }
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageLayout
      sidebar={
        !isMobile ? (
          <div className="relative h-full">
            {sidebarNode}
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
        ) : null
      }
    >
      {/* ── Mobile drawer + overlay ─────────────────────────────────────────── */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              "fixed inset-0 bg-black/50 z-20 transition-opacity duration-[var(--duration-slow)]",
              mobileOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none",
            )}
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />

          {/* Drawer */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-30 transition-transform duration-[var(--duration-slow)]",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            {/* Close button inside drawer */}
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "absolute top-3 right-3 z-10",
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  "text-sidebar-fg hover:text-sidebar-fg-active transition-colors",
                )}
                aria-label="Fechar menu"
              >
                <X size={14} />
              </button>
              {sidebarNode}
            </div>
          </div>
        </>
      )}

      {/* Global header */}
      <AppHeader
        onMenuToggle={isMobile ? () => setMobileOpen((v) => !v) : undefined}
      />
      <PageContent>{children}</PageContent>
    </PageLayout>
  );
}
