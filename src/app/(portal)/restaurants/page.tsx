"use client";

import { Text } from "@/components/primitives/text/Text";
import { RestaurantsView } from "@/features/restaurants/components/RestaurantsView";

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Restaurantes</Text>
        <Text variant="sm" muted className="mt-1">
          Todos os restaurantes cadastrados na plataforma.
        </Text>
      </div>
      <RestaurantsView />
    </div>
  );
}
