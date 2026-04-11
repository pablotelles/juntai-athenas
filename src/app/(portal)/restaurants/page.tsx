"use client";

import { Text } from "@/components/primitives/text/Text";
import { RestaurantsView } from "@/features/restaurants/components/RestaurantsView";

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Restaurantes e filiais</Text>
        <Text variant="sm" muted className="mt-1">
          Acompanhe as unidades disponíveis para o seu perfil e organize a expansão da operação.
        </Text>
      </div>
      <RestaurantsView />
    </div>
  );
}
