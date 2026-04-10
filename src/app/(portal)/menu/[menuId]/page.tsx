"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { CategoryList } from "@/features/menu/components/CategoryList";

export default function MenuCategoriesPage() {
  const { context } = useActiveContext();
  const params = useParams<{ menuId: string }>();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("locationId");

  if (context.type !== "restaurant") {
    return <Text variant="sm" muted>Selecione um restaurante.</Text>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Categorias</Text>
        <Text variant="sm" muted className="mt-1">
          Organize as categorias e arraste para reordenar.
        </Text>
      </div>

      <CategoryList
        menuId={params.menuId}
        restaurantId={context.restaurantId}
        locationId={locationId}
      />
    </div>
  );
}
