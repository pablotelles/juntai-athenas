"use client";

import * as React from "react";
import { Breadcrumb } from "@/components/compositions/breadcrumb/Breadcrumb";
import { ContextSwitcher } from "@/components/compositions/context-switcher/ContextSwitcher";
import { UserMenu } from "@/components/compositions/user-menu/UserMenu";
import { CommandPalette } from "@/components/compositions/command-palette/CommandPalette";
import { cn } from "@/lib/cn";

export function AppHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 px-4 border-b border-border bg-surface shrink-0",
        "h-[var(--header-height)]",
        className,
      )}
    >
      {/* Left: breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Right: global actions */}
      <div className="flex items-center gap-2 shrink-0">
        <CommandPalette />
        <ContextSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
