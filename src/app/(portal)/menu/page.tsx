"use client";

import * as React from "react";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { LocationPicker } from "@/features/restaurants/components/LocationPicker";
import { MenuList } from "@/features/menu/components/MenuList";

export default function MenuPage() {
  const { context } = useActiveContext();
  const [locationId, setLocationId] = React.useState<string | null>(null);

  if (context.type !== "restaurant") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Text variant="h2">Cardápio</Text>
          <Text variant="sm" muted className="mt-1">
            Gerenciamento de menus, categorias e produtos.
          </Text>
        </div>
        <Text variant="sm" muted>
          Selecione um restaurante para gerenciar o cardápio.
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Text variant="h2">Cardápio</Text>
          <Text variant="sm" muted className="mt-1">
            Gerencie menus, categorias e produtos.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Text variant="sm" muted>
            Filial:
          </Text>
          <LocationPicker
            restaurantId={context.restaurantId}
            value={locationId}
            onChange={setLocationId}
          />
        </div>
      </div>

      <MenuList
        restaurantId={context.restaurantId}
        locationId={locationId}
      />
    </div>
  );
}
