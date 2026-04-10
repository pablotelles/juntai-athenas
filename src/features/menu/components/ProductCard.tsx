"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, EyeOff, Eye, Trash2 } from "lucide-react";
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
import type { MenuItem } from "@juntai/types";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ProductCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onToggleAvailable: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function ProductCard({
  item,
  onEdit,
  onToggleAvailable,
  onDelete,
}: ProductCardProps) {
  return (
    <Card className="hover:border-border-strong transition-colors">
      <CardContent className="flex items-center gap-4 py-3">
        {/* Image thumbnail */}
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-12 w-12 rounded-md object-cover shrink-0 bg-secondary"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-secondary shrink-0" />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Text variant="sm" className="font-medium truncate">
              {item.name}
            </Text>
            <Badge variant={item.type === "composable" ? "info" : "secondary"}>
              {item.type === "composable" ? "Personalizável" : "Simples"}
            </Badge>
            {!item.isAvailable && (
              <Badge variant="secondary">Indisponível</Badge>
            )}
          </div>
          {item.description && (
            <Text variant="xs" muted className="mt-0.5 line-clamp-1">
              {item.description}
            </Text>
          )}
        </div>

        {/* Price */}
        <span className="text-sm font-semibold tabular-nums shrink-0">
          {formatPrice(item.basePrice)}
        </span>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ações do produto">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleAvailable(item)}>
              {item.isAvailable ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ocultar do cardápio
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Tornar disponível
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
