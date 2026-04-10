"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// MobileBottomBar
//
// Fixed bottom action bar, visible only on mobile (< lg).
// The parent owns all button content. The bar provides: position, background,
// shadow, safe-area padding, and a `justify-between` flex row.
//
// Layout contract:
//   - Secondary action (e.g. "Voltar") sits on the LEFT, auto width.
//   - Primary action (e.g. "Próximo") sits on the RIGHT, auto width.
//   - No child should force flex-1; use px-5/px-6 on the buttons instead.
//
// Usage:
//   <MobileBottomBar>
//     <Button variant="outline" onClick={handleBack}>Voltar</Button>
//     <Button onClick={handleNext}>Próximo</Button>
//   </MobileBottomBar>
//
// Companion: useMobileBottomBarOffset() → className for the scrollable container.
// ─────────────────────────────────────────────────────────────────────────────

export interface MobileBottomBarProps {
  children: React.ReactNode;
  /** Extra classes on the outer wrapper (e.g. custom z-index). */
  className?: string;
}

export function MobileBottomBar({ children, className }: MobileBottomBarProps) {
  return (
    <div
      className={cn(
        "lg:hidden",
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur border-t border-border shadow-[0_-2px_12px_0_rgba(0,0,0,0.08)]",
        className,
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useMobileBottomBarOffset
//
// Returns a className to apply bottom padding to the scrollable container
// so the bar never overlaps content. Desktop gets pb-0.
// ─────────────────────────────────────────────────────────────────────────────

export function useMobileBottomBarOffset() {
  // pb-20 ≈ 80px = ~52px bar + breathing room; removed at lg+
  return "pb-20 lg:pb-0";
}
