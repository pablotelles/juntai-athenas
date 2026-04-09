"use client";

import * as React from "react";
import { BookOpen } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shared/card/Card";
import { Badge } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import { LocationPicker } from "@/features/restaurants/components/LocationPicker";
import { useMenu } from "@/features/menu/hooks";
import { useLocations } from "@/features/restaurants/hooks";
import type { MenuItem } from "@/features/menu/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ── MenuItemRow ───────────────────────────────────────────────────────────────

function MenuItemRow({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <Text variant="sm" className="font-medium truncate">
            {item.name}
          </Text>
          {!item.isAvailable && <Badge variant="secondary">Indisponível</Badge>}
        </div>
        {item.description && (
          <Text variant="xs" muted className="line-clamp-2">
            {item.description}
          </Text>
        )}
      </div>
      <span className="text-sm font-semibold shrink-0 tabular-nums text-foreground">
        {formatPrice(item.basePrice)}
      </span>
    </div>
  );
}

// ── MenuView ─────────────────────────────────────────────────────────────────

interface MenuViewProps {
  restaurantId: string;
}

export function MenuView({ restaurantId }: MenuViewProps) {
  const { data: locations } = useLocations(restaurantId);
  const [locationId, setLocationId] = React.useState<string | null>(null);

  // Auto-select first location
  React.useEffect(() => {
    if (locations && locations.length > 0 && !locationId) {
      setLocationId(locations[0].id);
    }
  }, [locations, locationId]);

  const { data: menus, isLoading } = useMenu(restaurantId, locationId);

  return (
    <div className="flex flex-col gap-6">
      {/* Location picker */}
      <div className="flex items-center gap-3">
        <Text variant="sm" muted>
          Filial:
        </Text>
        <LocationPicker
          restaurantId={restaurantId}
          value={locationId}
          onChange={setLocationId}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-32 rounded-lg border border-border bg-secondary/30 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!menus || menus.length === 0) && locationId && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <BookOpen size={32} className="opacity-40" />
          <Text variant="sm">Nenhum cardápio cadastrado para esta filial.</Text>
        </div>
      )}

      {/* Menus */}
      {menus?.map((menu) => (
        <div key={menu.id} className="flex flex-col gap-4">
          <Text variant="h3">{menu.name}</Text>
          {menu.categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-0">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {category.items.length === 0 ? (
                  <Text variant="xs" muted>
                    Sem itens nesta categoria.
                  </Text>
                ) : (
                  category.items.map((item) => (
                    <MenuItemRow key={item.id} item={item} />
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
