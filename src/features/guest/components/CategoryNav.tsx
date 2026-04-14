"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Text } from "@/components/primitives/text/Text";

export interface CategoryNavItem {
  id: string;
  name: string;
}

export interface CategoryNavProps {
  categories: CategoryNavItem[];
  activeId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
}: CategoryNavProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll active chip into view
  React.useEffect(() => {
    if (!activeId || !scrollRef.current) return;
    const chip = scrollRef.current.querySelector<HTMLElement>(
      `[data-category-id="${activeId}"]`,
    );
    chip?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            type="button"
            data-category-id={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-foreground hover:border-border-strong",
            )}
          >
            <Text variant="xs" className={cn("font-medium", isActive && "text-primary-foreground")}>
              {cat.name}
            </Text>
          </button>
        );
      })}
    </div>
  );
}
