"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Breadcrumb } from "@/components/compositions/breadcrumb/Breadcrumb";
import { ContextSwitcher } from "@/components/compositions/context-switcher/ContextSwitcher";
import { UserMenu } from "@/components/compositions/user-menu/UserMenu";
import { CommandPalette } from "@/components/compositions/command-palette/CommandPalette";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { LocationPicker } from "@/features/restaurants/components/LocationPicker";
import { cn } from "@/lib/cn";

export interface AppHeaderProps {
  className?: string;
  /** When provided, a hamburger button is shown (for mobile drawer) */
  onMenuToggle?: () => void;
}

export function AppHeader({ className, onMenuToggle }: AppHeaderProps) {
  const { context, setLocationId } = useActiveContext();

  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 px-4 border-b border-border bg-surface shrink-0",
        "h-(--header-height)",
        className,
      )}
    >
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md shrink-0",
              "text-muted-foreground hover:text-foreground hover:bg-secondary",
              "transition-colors duration-(--duration-fast)",
            )}
            aria-label="Abrir menu de navegação"
          >
            <Menu size={18} />
          </button>
        )}
        <Breadcrumb />
      </div>

      {/* Right: global actions */}
      <div className="flex items-center gap-2 shrink-0">
        <CommandPalette />
        {context.type === "restaurant" && (
          <LocationPicker
            restaurantId={context.restaurantId}
            value={context.locationId ?? null}
            onChange={setLocationId}
            triggerClassName="w-44"
          />
        )}
        <ContextSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
