"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, EyeOff, Eye, Trash2, Package } from "lucide-react";
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
  const moreMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mais ações do produto"
          className="h-10 w-10 shrink-0"
        >
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
  );

  return (
    <Card className="hover:border-border-strong transition-colors">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Image thumbnail — slightly larger on mobile for visibility */}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="shrink-0 cursor-pointer"
            aria-label={`Editar ${item.name}`}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-14 w-14 lg:h-12 lg:w-12 rounded-lg object-cover bg-secondary"
              />
            ) : (
              <div className="h-14 w-14 lg:h-12 lg:w-12 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground/40">
                <Package className="h-5 w-5" />
              </div>
            )}
          </button>

          {/* Info — tapping opens edit on mobile */}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex-1 min-w-0 text-left cursor-pointer"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <Text variant="sm" className="font-medium truncate">
                {item.name}
              </Text>
              <Badge variant={item.type === "composable" ? "info" : "secondary"} className="hidden lg:inline-flex">
                {item.type === "composable" ? "Personalizável" : "Simples"}
              </Badge>
              {!item.isAvailable && (
                <Badge variant="secondary" className="hidden lg:inline-flex">Indisponível</Badge>
              )}
            </div>
            {item.description && (
              <Text variant="xs" muted className="mt-0.5 line-clamp-1">
                {item.description}
              </Text>
            )}
            {/* Price + status on mobile (below description) */}
            <div className="lg:hidden flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {formatPrice(item.basePrice)}
              </span>
              <Badge variant={item.type === "composable" ? "info" : "secondary"}>
                {item.type === "composable" ? "Personalizável" : "Simples"}
              </Badge>
              {!item.isAvailable && (
                <Badge variant="secondary">Indisponível</Badge>
              )}
            </div>
          </button>

          {/* Desktop: price column */}
          <span className="hidden lg:block text-sm font-semibold tabular-nums shrink-0">
            {formatPrice(item.basePrice)}
          </span>

          {/* Mobile: quick edit button + more menu */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              aria-label={`Editar ${item.name}`}
              className="lg:hidden h-10 w-10"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {moreMenu}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
