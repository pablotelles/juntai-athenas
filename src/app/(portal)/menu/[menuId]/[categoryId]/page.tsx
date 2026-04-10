"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { ProductList } from "@/features/menu/components/ProductList";
import { useMenu } from "@/features/menu/hooks";
import { useBreadcrumbLabel } from "@/contexts/breadcrumb/BreadcrumbProvider";

export default function CategoryProductsPage() {
  const { context } = useActiveContext();
  const params = useParams<{ menuId: string; categoryId: string }>();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("locationId");

  const restaurantId = context.type === "restaurant" ? context.restaurantId : null;
  const { data: menus } = useMenu(restaurantId ?? "", locationId);
  const menu = menus?.find((m) => m.id === params.menuId);
  const category = menu?.categories.find((c) => c.id === params.categoryId);
  useBreadcrumbLabel(params.menuId, menu?.name);
  useBreadcrumbLabel(params.categoryId, category?.name);

  if (context.type !== "restaurant") {
    return <Text variant="sm" muted>Selecione um restaurante.</Text>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text variant="h2">Produtos</Text>
        <Text variant="sm" muted className="mt-1">
          Crie e gerencie os produtos desta categoria.
        </Text>
      </div>

      <ProductList
        categoryId={params.categoryId}
        menuId={params.menuId}
        restaurantId={context.restaurantId}
        locationId={locationId}
      />
    </div>
  );
}
