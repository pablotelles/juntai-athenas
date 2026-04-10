"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
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
import type { Menu } from "@juntai/types";

interface MenuCardProps {
  menu: Menu;
  onManage: (menu: Menu) => void;
  onToggleActive: (menu: Menu) => void;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
}

export function MenuCard({ menu, onManage, onToggleActive, onEdit, onDelete }: MenuCardProps) {
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
          <Pencil className="h-4 w-4 mr-2" />
          Gerenciar categorias
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
    <Card className="hover:border-border-strong transition-colors">
      <CardContent className="py-0 px-0">
        <div className="flex items-center gap-3 px-4 py-4 min-w-0">
          <button
            type="button"
            className="flex-1 min-w-0 text-left cursor-pointer"
            onClick={() => onManage(menu)}
          >
            <Text variant="sm" className="font-medium truncate">
              {menu.name}
            </Text>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Text variant="xs" muted>
                Criado em {new Date(menu.createdAt).toLocaleDateString("pt-BR")}
              </Text>
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
  );
}
