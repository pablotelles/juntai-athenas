import * as React from "react";
import { cn } from "@/lib/cn";

export interface SubheaderProps extends React.HTMLAttributes<HTMLDivElement> {
  sticky?: boolean;
}

export function Subheader({
  sticky = false,
  className,
  children,
  ...props
}: SubheaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-surface/90 p-3 shadow-sm backdrop-blur sm:p-4 md:flex-row md:items-center md:justify-between",
        sticky && "sticky top-[calc(var(--header-height)+12px)] z-20",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SubheaderGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-1 flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}
