"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// BottomSheet
//
// Mobile-only slide-up sheet (lg: renders as a centered modal instead).
// Built on a native dialog + CSS for max compatibility — no external deps.
//
// Usage:
//   <BottomSheet open={open} onClose={() => setOpen(false)} title="Filtros">
//     <BottomSheetSection label="Status">
//       ...options
//     </BottomSheetSection>
//     <BottomSheetActions
//       onApply={handleApply}
//       onClear={handleClear}
//     />
//   </BottomSheet>
// ─────────────────────────────────────────────────────────────────────────────

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          // Mobile: slide up from bottom
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-background rounded-t-2xl shadow-[0_-4px_24px_0_rgba(0,0,0,0.12)]",
          "animate-in slide-in-from-bottom duration-300",
          // Desktop: centered modal
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2",
          "lg:rounded-xl lg:w-[480px] lg:shadow-[0_8px_40px_0_rgba(0,0,0,0.18)]",
          // Safe area for iPhone home indicator
          "pb-[env(safe-area-inset-bottom,0px)]",
          className,
        )}
        style={{ maxHeight: "85dvh" }}
      >
        {/* Drag handle (mobile visual cue) */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <span className="text-sm font-semibold">{title}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content — scrollable */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(85dvh - 80px)" }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BottomSheetSection — labeled group of options inside the sheet
// ─────────────────────────────────────────────────────────────────────────────

export interface BottomSheetSectionProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheetSection({
  label,
  children,
  className,
}: BottomSheetSectionProps) {
  return (
    <div className={cn("px-5 py-4 border-b border-border last:border-b-0", className)}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BottomSheetActions — sticky footer with Apply + Clear buttons
// ─────────────────────────────────────────────────────────────────────────────

export interface BottomSheetActionsProps {
  onApply: () => void;
  onClear: () => void;
  applyLabel?: string;
  clearLabel?: string;
}

export function BottomSheetActions({
  onApply,
  onClear,
  applyLabel = "Aplicar",
  clearLabel = "Limpar",
}: BottomSheetActionsProps) {
  return (
    <div className="sticky bottom-0 flex items-center gap-3 px-5 py-4 bg-background border-t border-border">
      <button
        type="button"
        onClick={onClear}
        className="flex-1 h-11 rounded-full border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        {clearLabel}
      </button>
      <button
        type="button"
        onClick={onApply}
        className="flex-1 h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {applyLabel}
      </button>
    </div>
  );
}
