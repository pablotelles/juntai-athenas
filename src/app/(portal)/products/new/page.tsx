"use client";

import { useSearchParams } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { ProductBuilderPage } from "@/features/menu/components/ProductBuilder";

export default function NewProductPage() {
  const { context } = useActiveContext();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");
  const menuId = searchParams.get("menuId");
  const locationIdFromUrl = searchParams.get("locationId");
  const locationId =
    locationIdFromUrl ?? (context.type === "restaurant" ? (context.locationId ?? null) : null);

  if (context.type !== "restaurant") {
    return <Text variant="sm" muted>Selecione um restaurante.</Text>;
  }

  if (!categoryId || !menuId) {
    return <Text variant="sm" muted>Parâmetros inválidos.</Text>;
  }

  const backHref = `/menu/${menuId}/${categoryId}`;

  return (
    // -m-6 cancels PageContent's p-6; height fills viewport below the header
    <div className="-m-6 h-[calc(100vh-var(--header-height))] overflow-hidden">
      <ProductBuilderPage
        categoryId={categoryId}
        menuId={menuId}
        restaurantId={context.restaurantId}
        locationId={locationId}
        backHref={backHref}
      />
    </div>
  );
}
