"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { BackButton } from "@/components/primitives/back-button/BackButton";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { CategoryList } from "@/features/menu/components/CategoryList";
import { useMenu } from "@/features/menu/hooks";
import { useBreadcrumbLabel } from "@/contexts/breadcrumb/BreadcrumbProvider";

export default function MenuCategoriesPage() {
  const { context } = useActiveContext();
  const params = useParams<{ menuId: string }>();
  const searchParams = useSearchParams();
  const locationIdFromUrl = searchParams.get("locationId");
  const locationId = locationIdFromUrl ?? (context.type === "restaurant" ? (context.locationId ?? null) : null);

  const restaurantId = context.type === "restaurant" ? context.restaurantId : null;
  const { data: menus } = useMenu(restaurantId ?? "", locationId);
  const menu = menus?.find((m) => m.id === params.menuId);
  useBreadcrumbLabel(params.menuId, menu?.name);

  if (context.type !== "restaurant") {
    return <Text variant="sm" muted>Selecione um restaurante.</Text>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <BackButton href="/menu" className="mt-1" />
        <div>
          <Text variant="h2">Categorias</Text>
          <Text variant="sm" muted className="mt-1">
            Organize as categorias e arraste para reordenar.
          </Text>
        </div>
      </div>

      <CategoryList
        menuId={params.menuId}
        restaurantId={context.restaurantId}
        locationId={locationId}
      />
    </div>
  );
}
