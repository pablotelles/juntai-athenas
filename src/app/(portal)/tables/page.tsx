"use client";

import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { TablesView } from "@/features/tables/components/TablesView";

export default function TablesPage() {
  const { context } = useActiveContext();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Mesas</Text>
        <Text variant="sm" muted className="mt-1">
          Gerenciamento de mesas e ocupação do salão.
        </Text>
      </div>

      {context.type === "restaurant" ? (
        <TablesView restaurantId={context.restaurantId} />
      ) : (
        <Text variant="sm" muted>
          Selecione um restaurante para ver as mesas.
        </Text>
      )}
    </div>
  );
}
