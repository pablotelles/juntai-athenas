"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToastContext, type ToastItem, type ToastVariant } from "@/contexts/toast/ToastProvider";

// ─── Variant config ───────────────────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; bar: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />,
    iconColor: "text-success",
    bar: "bg-success",
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />,
    iconColor: "text-destructive",
    bar: "bg-destructive",
  },
  info: {
    icon: <Info className="h-4 w-4 shrink-0" aria-hidden />,
    iconColor: "text-info",
    bar: "bg-info",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />,
    iconColor: "text-warning",
    bar: "bg-warning",
  },
};

// ─── Single Toast ─────────────────────────────────────────────────────────────

interface ToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
}

function Toast({ item, onDismiss }: ToastProps) {
  const { icon, iconColor, bar } = variantConfig[item.variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        // Layout
        "relative flex items-start gap-3 overflow-hidden",
        "w-80 rounded-lg border border-border bg-surface shadow-lg",
        "px-4 pt-3 pb-4",
        // Enter animation (same pattern as Modal)
        "animate-in slide-in-from-bottom-2 fade-in-0 duration-200",
        // Exit animation driven by isExiting flag
        item.isExiting &&
          "animate-out fade-out-0 slide-out-to-bottom-2 duration-150 fill-mode-forwards",
      )}
    >
      {/* Colored bar on the left */}
      <span className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", bar)} />

      {/* Icon */}
      <span className={cn("mt-0.5", iconColor)}>{icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {item.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(item.id)}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        aria-label="Fechar notificação"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Toaster (portal container) ──────────────────────────────────────────────

export function Toaster() {
  const { toasts, dismiss } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notificações"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <Toast item={item} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}
