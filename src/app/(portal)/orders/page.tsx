"use client";

import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { OrdersView } from "@/features/orders/components/OrdersView";

export default function OrdersPage() {
  const { context } = useActiveContext();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Pedidos</Text>
        <Text variant="sm" muted className="mt-1">
          Gerenciamento de pedidos em tempo real.
        </Text>
      </div>

      {context.type === "restaurant" ? (
        <OrdersView restaurantId={context.restaurantId} />
      ) : (
        <Text variant="sm" muted>
          Selecione um restaurante para ver os pedidos.
        </Text>
      )}
    </div>
  );
}
