import * as React from "react";
import { cn } from "@/lib/cn";

export interface MesaGridProps extends React.HTMLAttributes<HTMLDivElement> {
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
}

export function MesaGrid({
  isEmpty = false,
  emptyState,
  className,
  children,
  ...props
}: MesaGridProps) {
  if (isEmpty && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}
