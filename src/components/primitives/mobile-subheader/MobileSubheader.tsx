"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// MobileSubheader
//
// A fixed bar that sits flush below the site's main AppHeader on mobile.
// Hidden on desktop (lg+) — use your normal desktop header structure there.
//
// Positioning: `fixed top-[var(--header-height)]` so it always tracks
// the header regardless of scroll. The companion hook
// `useMobileSubheaderOffset` returns a className to add top-padding to the
// page content so nothing slides under this bar.
//
// Usage:
//   <MobileSubheader>
//     <div className="flex items-center gap-2">
//       <button aria-label="Voltar"><ArrowLeft size={18} /></button>
//       <h1 className="text-[18px] font-semibold flex-1">Título</h1>
//       <span className="text-xs text-muted-foreground">2 / 3</span>
//     </div>
//     <MobileStepBar steps={...} currentStep={...} />  ← optional, any node
//   </MobileSubheader>
// ─────────────────────────────────────────────────────────────────────────────

export interface MobileSubheaderProps {
  children: React.ReactNode;
  /** Extra classes on the container (e.g. to override z-index). */
  className?: string;
}

export function MobileSubheader({ children, className }: MobileSubheaderProps) {
  return (
    <div
      className={cn(
        // Mobile only
        "lg:hidden",
        // Stick right below the site header
        "fixed left-0 right-0 z-20",
        "top-[var(--header-height)]",
        // Visual
        "bg-background/95 backdrop-blur border-b border-border",
        // Spacing
        "px-4 pt-3 pb-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// useMobileSubheaderOffset
//
// Returns a className string to apply to the scrollable content container
// so it starts below both the site header and this subheader.
// Desktop gets the regular top-0 treatment (lg:pt-0).
//
// The total offset is: --header-height (56px) + subheader height (~80px) ≈ 136px.
// Expressed as a Tailwind arbitrary value so it stays in sync with the CSS var.
// ─────────────────────────────────────────────────────────────────────────────

export function useMobileSubheaderOffset() {
  // pt-[calc(var(--header-height)+80px)] pushes content below site header + subheader.
  // lg:pt-0 removes it on desktop where the subheader is hidden.
  return "pt-[calc(var(--header-height)+80px)] lg:pt-0";
}
