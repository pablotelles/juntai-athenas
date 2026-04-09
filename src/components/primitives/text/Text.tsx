import * as React from "react";
import { cn } from "@/lib/cn";

type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "sm"
  | "xs"
  | "label"
  | "mono";

const variantMap: Record<TextVariant, { tag: string; className: string }> = {
  h1: {
    tag: "h1",
    className: "text-3xl font-bold leading-tight tracking-tight",
  },
  h2: {
    tag: "h2",
    className: "text-2xl font-semibold leading-tight tracking-tight",
  },
  h3: { tag: "h3", className: "text-xl font-semibold leading-snug" },
  h4: { tag: "h4", className: "text-lg font-semibold leading-snug" },
  body: { tag: "p", className: "text-sm leading-relaxed" },
  sm: { tag: "p", className: "text-xs leading-relaxed" },
  xs: { tag: "span", className: "text-[10px] leading-normal" },
  label: {
    tag: "span",
    className: "text-xs font-medium uppercase tracking-wide",
  },
  mono: { tag: "code", className: "text-xs font-mono" },
};

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  muted?: boolean;
  as?: React.ElementType;
}

export function Text({
  variant = "body",
  muted = false,
  as,
  className,
  children,
  ...props
}: TextProps) {
  const { tag, className: variantClass } = variantMap[variant];
  const Tag = (as ?? tag) as React.ElementType;

  return (
    <Tag
      className={cn(variantClass, muted && "text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
