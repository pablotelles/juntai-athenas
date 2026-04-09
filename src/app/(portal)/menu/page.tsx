"use client";

import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { MenuView } from "@/features/menu/components/MenuView";

export default function MenuPage() {
  const { context } = useActiveContext();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Cardápio</Text>
        <Text variant="sm" muted className="mt-1">
          Gerenciamento de itens, categorias e preços.
        </Text>
      </div>

      {context.type === "restaurant" ? (
        <MenuView restaurantId={context.restaurantId} />
      ) : (
        <Text variant="sm" muted>
          Selecione um restaurante para ver o cardápio.
        </Text>
      )}
    </div>
  );
}
