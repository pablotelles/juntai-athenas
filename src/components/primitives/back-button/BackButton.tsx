"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

export interface BackButtonProps {
  /** Destination href for the back navigation. */
  href: string;
  /** Optional text label shown beside the arrow. */
  label?: string;
  className?: string;
}

export function BackButton({ href, label, className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm select-none",
        className,
      )}
      aria-label={label ?? "Voltar"}
    >
      <ArrowLeft size={16} strokeWidth={2.5} />
      {label && <span>{label}</span>}
    </Link>
  );
}
