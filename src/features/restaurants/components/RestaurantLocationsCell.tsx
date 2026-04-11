"use client";

import { MapPin } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { useLocations } from "@/features/restaurants/hooks";

export function RestaurantLocationsCell({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const { data: locations, isLoading } = useLocations(restaurantId);

  if (isLoading) {
    return (
      <Text variant="xs" muted>
        Carregando filiais…
      </Text>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <Text variant="xs" muted>
        Nenhuma filial cadastrada.
      </Text>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {locations.slice(0, 2).map((location) => (
        <div key={location.id} className="min-w-0">
          <div className="flex items-center gap-1">
            <MapPin size={12} className="shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium text-foreground">
              {location.name}
            </span>
          </div>
          <Text variant="xs" muted className="block pl-4">
            {location.address.city}/{location.address.state}
          </Text>
        </div>
      ))}

      {locations.length > 2 ? (
        <Text variant="xs" muted>
          +{locations.length - 2} filiais
        </Text>
      ) : null}
    </div>
  );
}
