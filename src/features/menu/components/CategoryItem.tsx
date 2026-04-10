"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/shared/switch/Switch";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/shared/dropdown-menu/DropdownMenu";
import { Button } from "@/components/primitives/button/Button";
import { cn } from "@/lib/cn";
import type { Category, MenuItem } from "@juntai/types";

export type CategoryWithItems = Category & { items: MenuItem[] };

interface CategoryItemProps {
  category: CategoryWithItems;
  onNavigate: (category: CategoryWithItems) => void;
  onToggleActive: (category: CategoryWithItems, active: boolean) => void;
  onEdit: (category: CategoryWithItems) => void;
  onDelete: (category: CategoryWithItems) => void;
}

export function CategoryItem({
  category,
  onNavigate,
  onToggleActive,
  onEdit,
  onDelete,
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
        className="flex items-center justify-center h-10 w-8 -ml-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Arrastar para reordenar"
        tabIndex={0}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Name + product count — clicável para navegar */}
      <button
        className="flex-1 min-w-0 text-left flex items-center gap-2 group py-1 cursor-pointer"
        onClick={() => onNavigate(category)}
      >
        <div className="min-w-0 flex-1">
          <Text variant="sm" className="font-medium truncate group-hover:text-primary transition-colors">
            {category.name}
          </Text>
          <span className="lg:hidden text-xs text-muted-foreground">
            {category.items.length} {category.items.length === 1 ? "produto" : "produtos"}
          </span>
        </div>
        <Badge variant="secondary" className="hidden lg:inline-flex tabular-nums shrink-0">
          {category.items.length}
        </Badge>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </button>

      {/* Active toggle */}
      <Switch
        checked={category.isActive}
        onCheckedChange={(checked) => onToggleActive(category, checked)}
        aria-label={`${category.isActive ? "Desativar" : "Ativar"} categoria`}
      />

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mais ações da categoria"
            className="h-10 w-10 shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4 mr-2" />
            Renomear
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
