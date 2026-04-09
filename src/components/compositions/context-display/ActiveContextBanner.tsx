"use client";

import * as React from "react";
import { Globe, Building2, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import {
  useActiveContext,
  type ActiveContextValue,
} from "@/contexts/active-context/ActiveContextProvider";
import {
  findGroup,
  findRestaurant,
  findGroupOfRestaurant,
} from "@/config/mock-data";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────
// ActiveContextBanner
// Shows the active context as a badge row — use in placeholder pages.
// ─────────────────────────────────────────────────────────────

export function ActiveContextBanner({ className }: { className?: string }) {
  const { context } = useActiveContext();

  const info = resolveContextInfo(context);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3",
        className,
      )}
    >
      <span className="text-muted-foreground shrink-0">{info.icon}</span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <Text variant="sm" className="font-medium">
            Contexto ativo
          </Text>
          <Badge variant={info.variant}>{info.typeLabel}</Badge>
        </div>
        <Text variant="xs" muted className="truncate">
          {info.detail}
        </Text>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Internal helper
// ─────────────────────────────────────────────────────────────

type BadgeVariant = "info" | "secondary" | "success";

interface ContextInfo {
  icon: React.ReactNode;
  typeLabel: string;
  detail: string;
  variant: BadgeVariant;
}

function resolveContextInfo(ctx: ActiveContextValue): ContextInfo {
  if (ctx.type === "platform") {
    return {
      icon: <Globe size={18} />,
      typeLabel: "platform",
      detail: "Visão global da plataforma Juntai",
      variant: "info",
    };
  }

  if (ctx.type === "group") {
    const group = findGroup(ctx.groupId);
    return {
      icon: <Building2 size={18} />,
      typeLabel: "group",
      detail: group
        ? `${group.name} · ${group.restaurants.length} restaurante(s)`
        : ctx.groupId,
      variant: "secondary",
    };
  }

  // restaurant
  const restaurant = findRestaurant(ctx.restaurantId);
  const group = findGroupOfRestaurant(ctx.restaurantId);
  return {
    icon: <UtensilsCrossed size={18} />,
    typeLabel: "restaurant",
    detail:
      [restaurant?.name, group?.name].filter(Boolean).join(" · ") ||
      ctx.restaurantId,
    variant: "success",
  };
}
