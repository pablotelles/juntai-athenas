import * as React from "react";
import { cn } from "@/lib/cn";

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export function Header({
  title,
  description,
  actions,
  breadcrumb,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-surface shrink-0",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        {breadcrumb && <div className="mb-1">{breadcrumb}</div>}
        {title && (
          <h1 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-sm text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </header>
  );
}
