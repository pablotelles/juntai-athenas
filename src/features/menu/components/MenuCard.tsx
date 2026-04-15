"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  LayoutList,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/shared/card/Card";
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
import type { Menu } from "@juntai/types";

interface MenuCardProps {
  menu: Menu;
  onManage: (menu: Menu) => void;
  onToggleActive: (menu: Menu) => void;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
}

export function MenuCard({ menu, onManage, onToggleActive, onEdit, onDelete }: MenuCardProps) {
  const isFlat = menu.style === "flat";
  const StyleIcon = isFlat ? LayoutList : Layers;
  const manageLabel = isFlat ? "Gerenciar itens" : "Gerenciar categorias";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const actions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ações do menu"
          className="h-10 w-10 shrink-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onManage(menu)}>
          <StyleIcon className="h-4 w-4 mr-2" />
          {manageLabel}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(menu)}>
          <Pencil className="h-4 w-4 mr-2" />
          Renomear
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleActive(menu)}>
          <Power className="h-4 w-4 mr-2" />
          {menu.isActive ? "Desativar" : "Ativar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(menu)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50 z-10")}>
      <Card className="hover:border-border-strong transition-colors">
        <CardContent className="py-0 px-0">
          <div className="flex items-center gap-1 px-2 py-4 min-w-0">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="flex items-center justify-center h-10 w-8 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
              aria-label="Arrastar para reordenar"
              tabIndex={0}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            {/* Content */}
            <button
              type="button"
              className="flex-1 min-w-0 text-left cursor-pointer px-1"
              onClick={() => onManage(menu)}
            >
              <Text variant="sm" className="font-medium truncate">
                {menu.name}
              </Text>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Text variant="xs" muted>
                  Criado em {new Date(menu.createdAt).toLocaleDateString("pt-BR")}
                </Text>
                <Badge variant="secondary" className="gap-1">
                  <StyleIcon className="h-2.5 w-2.5" />
                  {isFlat ? "Simples" : "Com categorias"}
                </Badge>
                <Badge variant={menu.isActive ? "success" : "secondary"} dot className="lg:hidden">
                  {menu.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={menu.isActive ? "success" : "secondary"} dot className="hidden lg:flex">
                {menu.isActive ? "Ativo" : "Inativo"}
              </Badge>
              {actions}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
