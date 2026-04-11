"use client";

import * as React from "react";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { MenuList } from "@/features/menu/components/MenuList";

export default function MenuPage() {
  const { context } = useActiveContext();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted || context.type !== "restaurant") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Text variant="h2">Cardápio</Text>
          <Text variant="sm" muted className="mt-1">
            Gerenciamento de menus, categorias e produtos.
          </Text>
        </div>
        {mounted && (
          <Text variant="sm" muted>
            Selecione um restaurante para gerenciar o cardápio.
          </Text>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Cardápio</Text>
        <Text variant="sm" muted className="mt-1">
          Gerencie menus, categorias e produtos.
        </Text>
      </div>

      <MenuList
        restaurantId={context.restaurantId}
        locationId={context.locationId ?? null}
      />
    </div>
  );
}
