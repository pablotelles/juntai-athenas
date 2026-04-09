"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/primitives/icon/Icon";
import { Badge } from "@/components/primitives/badge/Badge";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  exact?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface SidebarProps {
  sections: NavSection[];
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  className?: string;
}

export function Sidebar({
  sections,
  logo,
  footer,
  collapsed = false,
  className,
}: SidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar-bg border-r border-sidebar-border h-full",
        "transition-[width] duration-[var(--duration-slow)]",
        collapsed
          ? "w-[var(--sidebar-width-collapsed)]"
          : "w-[var(--sidebar-width)]",
        className,
      )}
    >
      {/* Logo */}
      {logo && (
        <div
          className={cn(
            "flex items-center h-[var(--header-height)] px-4 border-b border-sidebar-border shrink-0",
            collapsed && "justify-center px-0",
          )}
        >
          {logo}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {sections.map((section, si) => (
          <div key={si} className="mb-4">
            {section.title && !collapsed && (
              <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-sidebar-fg/50">
                {section.title}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        "text-sidebar-fg hover:text-sidebar-fg-active hover:bg-sidebar-active",
                        isActive && "bg-sidebar-active text-sidebar-fg-active",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon icon={item.icon} size={18} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge != null && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-[10px] h-4 px-1.5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div
          className={cn(
            "shrink-0 border-t border-sidebar-border p-2",
            collapsed && "flex justify-center",
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
