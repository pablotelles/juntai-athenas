"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// FAB — Floating Action Button
//
// Fixed circular button anchored bottom-right, mobile-only by default (lg:hidden).
// Sits above the MobileBottomBar when present (bottom offset accounts for ~64px bar).
//
// Usage:
//   <FAB onClick={() => setCreateOpen(true)} label="Novo cardápio" />
//   <FAB onClick={navigateToBuilder} label="Novo produto" icon={<Plus size={22} />} />
//
// Props:
//   label    — aria-label (required for accessibility)
//   onClick  — action
//   icon     — icon node; defaults to <Plus />
//   mobileOnly — when true (default) hides on lg+; pass false to always show
//   className  — extra classes on the button
// ─────────────────────────────────────────────────────────────────────────────

export interface FABProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  mobileOnly?: boolean;
  className?: string;
}

export function FAB({
  label,
  onClick,
  icon = <Plus size={22} aria-hidden="true" />,
  mobileOnly = true,
  className,
}: FABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        // Visibility
        mobileOnly && "lg:hidden",
        // Position — sits above MobileBottomBar (bottom-20 = 80px)
        "fixed right-4 z-30",
        "bottom-[calc(env(safe-area-inset-bottom,0px)+80px)]",
        // Shape & size
        "h-14 w-14 rounded-full",
        // Color
        "bg-primary text-primary-foreground",
        // Shadow — elevated feel
        "shadow-[0_4px_16px_0_rgba(0,0,0,0.18)] active:shadow-[0_2px_8px_0_rgba(0,0,0,0.18)]",
        // Interaction
        "flex items-center justify-center",
        "transition-transform duration-150 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
        className,
      )}
    >
      {icon}
    </button>
  );
}
