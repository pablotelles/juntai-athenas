"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronRight } from "lucide-react";
import { Switch } from "@/components/shared/switch/Switch";
import { Text } from "@/components/primitives/text/Text";
import { cn } from "@/lib/cn";
import type { Category } from "@juntai/types";

interface CategoryItemProps {
  category: Category;
  onNavigate: (category: Category) => void;
  onToggleActive: (category: Category, active: boolean) => void;
}

export function CategoryItem({
  category,
  onNavigate,
  onToggleActive,
}: CategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-surface",
        "hover:border-border-strong transition-colors",
        isDragging && "opacity-50 shadow-lg z-10",
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        aria-label="Arrastar para reordenar"
        tabIndex={0}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Name — clicável para navegar */}
      <button
        className="flex-1 min-w-0 text-left flex items-center gap-1 group"
        onClick={() => onNavigate(category)}
      >
        <Text variant="sm" className="font-medium truncate group-hover:text-primary transition-colors">
          {category.name}
        </Text>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </button>

      {/* Active toggle */}
      <Switch
        checked={category.isActive}
        onCheckedChange={(checked) => onToggleActive(category, checked)}
        aria-label={`${category.isActive ? "Desativar" : "Ativar"} categoria`}
      />
    </div>
  );
}
