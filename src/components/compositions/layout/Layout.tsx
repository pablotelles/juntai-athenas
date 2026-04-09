import * as React from "react";
import { cn } from "@/lib/cn";

// ─── PageContainer ────────────────────────────────────────────────────────────

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply a max-width and center the content. Defaults to true. */
  constrained?: boolean;
}

/**
 * Top-level page wrapper.
 * Centers content, applies consistent horizontal padding at every breakpoint.
 */
export function PageContainer({
  constrained = true,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 lg:px-8",
        constrained && "max-w-7xl mx-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Stack ────────────────────────────────────────────────────────────────────

const STACK_GAP = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: keyof typeof STACK_GAP;
}

/**
 * Vertical flex container with a consistent gap scale.
 */
export function Stack({ gap = "md", className, children, ...props }: StackProps) {
  return (
    <div
      className={cn("flex flex-col", STACK_GAP[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID_COLS = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
} as const;

const GRID_GAP = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
} as const;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: keyof typeof GRID_COLS;
  gap?: keyof typeof GRID_GAP;
}

/**
 * Responsive CSS grid.
 * Goes from 1 column on mobile up to `cols` on desktop.
 */
export function Grid({
  cols = 2,
  gap = "md",
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={cn("grid", GRID_COLS[cols], GRID_GAP[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * Titled content section with an optional description and action area.
 */
export function Section({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeader = title ?? description ?? actions;
  return (
    <section className={cn("flex flex-col gap-4", className)} {...props}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            {title && (
              <h2 className="text-base font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// ─── FormGrid ────────────────────────────────────────────────────────────────

export interface FormGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns on md+ screens. Defaults to 2. */
  cols?: 1 | 2 | 3;
}

const FORM_COLS = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
} as const;

/**
 * Responsive form layout grid.
 * Always 1 column on mobile, `cols` columns on md+.
 * All inputs use `w-full` automatically via this grid.
 */
export function FormGrid({
  cols = 2,
  className,
  children,
  ...props
}: FormGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        FORM_COLS[cols],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
