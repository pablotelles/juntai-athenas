"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────
// Route segment → human label map
// ─────────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  restaurants: "Restaurantes",
  orders: "Pedidos",
  menu: "Cardápio",
  tables: "Mesas",
  finance: "Financeiro",
  reports: "Relatórios",
  settings: "Configurações",
  admin: "Admin",
  restaurant: "Restaurante",
};

// ─────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────

export function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg, index, arr) => ({
      label: ROUTE_LABELS[seg] ?? seg,
      href: "/" + arr.slice(0, index + 1).join("/"),
      isLast: index === arr.length - 1,
    }));

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm min-w-0", className)}
    >
      {segments.map((seg, i) => (
        <React.Fragment key={seg.href}>
          {i > 0 && (
            <ChevronRight
              size={13}
              className="text-muted-foreground shrink-0"
              aria-hidden="true"
            />
          )}
          {seg.isLast ? (
            <span className="font-medium text-foreground truncate">
              {seg.label}
            </span>
          ) : (
            <Link
              href={seg.href}
              className="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              {seg.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
