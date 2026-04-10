import * as React from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  label: string;
  icon: React.ReactNode;
  variant?: "ghost" | "outline" | "secondary" | "destructive";
  size?: "sm" | "md";
}

const variantClasses = {
  ghost: "border-transparent bg-transparent text-foreground hover:bg-secondary",
  outline: "border-border bg-background text-foreground hover:bg-secondary",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:opacity-90",
  destructive:
    "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15",
} as const;

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
} as const;

export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "sm",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
