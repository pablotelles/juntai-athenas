"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  BottomSheet,
  BottomSheetSection,
} from "@/components/primitives/bottom-sheet/BottomSheet";
import { cn } from "@/lib/cn";

export interface ActionSheetItem {
  key: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  tone?: "default" | "destructive";
}

export interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: ActionSheetItem[];
}

export function ActionSheet({
  open,
  onClose,
  title = "Ações rápidas",
  items,
}: ActionSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <BottomSheetSection className="px-3 py-2">
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                onClose();
              }}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2",
                item.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-secondary active:bg-secondary/80",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  item.tone === "destructive"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-foreground",
                )}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    item.tone === "destructive"
                      ? "text-destructive"
                      : "text-foreground",
                  )}
                >
                  {item.label}
                </span>
                {item.description ? (
                  <span className="block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </span>
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </BottomSheetSection>
    </BottomSheet>
  );
}
