"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Power } from "lucide-react";
import { Card, CardContent } from "@/components/shared/card/Card";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shared/dropdown-menu/DropdownMenu";
import { Button } from "@/components/primitives/button/Button";
import type { Menu } from "@juntai/types";

interface MenuCardProps {
  menu: Menu;
  onManage: (menu: Menu) => void;
  onToggleActive: (menu: Menu) => void;
}

export function MenuCard({ menu, onManage, onToggleActive }: MenuCardProps) {
  return (
    <Card className="hover:border-border-strong transition-colors">
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div
          role="button"
          tabIndex={0}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          onClick={() => onManage(menu)}
          onKeyDown={(e) => e.key === "Enter" && onManage(menu)}
        >
          <div className="min-w-0">
            <Text variant="sm" className="font-medium truncate">
              {menu.name}
            </Text>
            <Text variant="xs" muted className="mt-0.5">
              Criado em {new Date(menu.createdAt).toLocaleDateString("pt-BR")}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={menu.isActive ? "success" : "secondary"} dot>
            {menu.isActive ? "Ativo" : "Inativo"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ações do menu">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onManage(menu)}>
                <Pencil className="h-4 w-4 mr-2" />
                Gerenciar categorias
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(menu)}>
                <Power className="h-4 w-4 mr-2" />
                {menu.isActive ? "Desativar" : "Ativar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
