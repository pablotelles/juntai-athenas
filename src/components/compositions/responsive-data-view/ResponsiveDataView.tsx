"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { useIsMobile } from "@/hooks/useIsMobile";

// ─── ResponsiveDataView ───────────────────────────────────────────────────────

export interface ResponsiveDataViewProps {
  /** Full table — shown on desktop (lg+) */
  table: React.ReactNode;
  /** Card list — shown on mobile (< lg) */
  card: React.ReactNode;
  className?: string;
  /**
   * Override auto-detection.
   * Useful in Storybook or tests to lock one view without resizing.
   */
  forceView?: "table" | "card";
}

/**
 * Switches automatically between a full DataTable (desktop) and a card list
 * (mobile) at the `lg` breakpoint (1024px).
 */
export function ResponsiveDataView({
  table,
  card,
  className,
  forceView,
}: ResponsiveDataViewProps) {
  const isMobile = useIsMobile();
  const showCard = forceView ? forceView === "card" : isMobile;

  return <div className={cn("w-full", className)}>{showCard ? card : table}</div>;
}

// ─── CardList ─────────────────────────────────────────────────────────────────

export interface CardListProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * Generic card list for mobile data views.
 * Pair with `DataTable` inside `ResponsiveDataView`.
 */
export function CardList<T>({
  data,
  renderCard,
  isLoading = false,
  emptyState,
  className,
}: CardListProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-4 animate-pulse"
          >
            <div className="h-4 bg-secondary rounded w-1/2 mb-3" />
            <div className="h-3 bg-secondary rounded w-3/4 mb-2" />
            <div className="h-3 bg-secondary rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
}

// ─── DataCard ─────────────────────────────────────────────────────────────────
// Opinionated card shell for CardList items

export interface DataCardField {
  label: string;
  value: React.ReactNode;
}

export interface DataCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  fields?: DataCardField[];
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Ready-made card layout for `CardList` rows.
 * Shows a title, optional subtitle/badge, key-value fields, and actions.
 */
export function DataCard({
  title,
  subtitle,
  badge,
  fields = [],
  actions,
  className,
}: DataCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-4",
        "flex flex-col gap-3",
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="font-medium text-sm text-foreground truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate">
              {subtitle}
            </div>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {f.label}
              </dt>
              <dd className="text-xs text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          {actions}
        </div>
      )}
    </div>
  );
}
