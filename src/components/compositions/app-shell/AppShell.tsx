"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { resolvePortalProfile } from "@/lib/access";
import type { NavSection, NavItem } from "@/components/compositions/sidebar/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { context } = useActiveContext();
  const { user, memberships } = useAuth();
  const restaurantId =
    context.type === "restaurant" ? context.restaurantId : undefined;
  const profile = resolvePortalProfile(memberships, context.type, restaurantId);

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

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    const fallback =
      context.type === "restaurant" ? "/restaurant" : "/dashboard";

    // 1. Context-based redirect: some routes only exist in one context
    const isPlatformOnlyRoute = pathname === "/restaurants";
    const isRestaurantOnlyRoute =
      pathname === "/orders" ||
      pathname === "/menu" ||
      pathname.startsWith("/menu/") ||
      pathname === "/tables" ||
      pathname === "/products/new" ||
      pathname.startsWith("/products/");

    if (context.type === "restaurant" && isPlatformOnlyRoute) {
      router.replace("/restaurant");
      return;
    }
    if (context.type === "platform" && isRestaurantOnlyRoute) {
      router.replace("/dashboard");
      return;
    }

    // 2. Profile-based redirect: hide routes the current profile can't access
    const matchingNavItem = NAV_ITEMS.find((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(item.href + "/"),
    );
    if (
      matchingNavItem?.profiles &&
      !matchingNavItem.profiles.includes(profile)
    ) {
      router.replace(fallback);
    }
  }, [context.type, mounted, pathname, profile, router]);

  // ── Dynamic nav: filter by active context ──────────────────────────────────
  // Deferred to post-mount to avoid server/client hydration mismatch,
  // since context.type is client-only state (localStorage/session).
  const sections: NavSection[] = React.useMemo(() => {
    if (!mounted) return [];
    const filtered = NAV_ITEMS.filter(
      (item) =>
        item.contexts.includes(context.type) &&
        (!item.profiles || item.profiles.includes(profile)),
    );
    const mapItem = (item: (typeof NAV_ITEMS)[number]): NavItem => ({
      label: item.label,
      href: item.href,
      icon: item.icon,
      badge: item.badge,
      exact: item.exact,
      subitems: item.subitems
        ?.filter(
          (sub) =>
            sub.contexts.includes(context.type) &&
            (!sub.profiles || sub.profiles.includes(profile)),
        )
        .map((sub) => ({
          label: sub.label,
          href: sub.href,
          icon: sub.icon,
          badge: sub.badge,
          exact: sub.exact,
        })),
    });
    const mainItems = filtered
      .filter((i) => i.href !== "/settings")
      .map(mapItem);
    const systemItems = filtered
      .filter((i) => i.href === "/settings")
      .map(mapItem);
    return [
      { items: mainItems },
      ...(systemItems.length > 0
        ? [{ title: "Sistema", items: systemItems }]
        : []),
    ].filter((s) => s.items.length > 0);
  }, [mounted, context.type, profile]);

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
          <Avatar fallback={mounted ? userInitials : "?"} size="sm" />
          {(!collapsed || isMobile) && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-sidebar-fg-active truncate">
                {mounted ? (user?.name ?? "Usuário") : "Usuário"}
              </span>
              <span className="text-[10px] text-sidebar-fg truncate">
                {mounted ? (user?.email ?? "") : ""}
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
                  "transition-transform duration-(--duration-slow)",
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
              "fixed inset-0 bg-black/50 z-20 transition-opacity duration-(--duration-slow)",
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
              "fixed inset-y-0 left-0 z-30 transition-transform duration-(--duration-slow)",
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
