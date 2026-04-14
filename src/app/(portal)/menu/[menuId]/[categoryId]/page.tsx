"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { BackButton } from "@/components/primitives/back-button/BackButton";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { ProductList } from "@/features/menu/components/ProductList";
import { useMenu } from "@/features/menu/hooks";
import { useBreadcrumbLabel } from "@/contexts/breadcrumb/BreadcrumbProvider";

export default function CategoryProductsPage() {
  return (
    <Suspense fallback={null}>
      <CategoryProductsPageContent />
    </Suspense>
  );
}

function CategoryProductsPageContent() {
  const { context } = useActiveContext();
  const params = useParams<{ menuId: string; categoryId: string }>();
  const searchParams = useSearchParams();
  const locationIdFromUrl = searchParams.get("locationId");
  const locationId =
    locationIdFromUrl ??
    (context.type === "restaurant" ? (context.locationId ?? null) : null);

  const restaurantId =
    context.type === "restaurant" ? context.restaurantId : null;
  const { data: menus } = useMenu(restaurantId ?? "", locationId);
  const menu = menus?.find((m) => m.id === params.menuId);
  const category = menu?.categories.find((c) => c.id === params.categoryId);
  const isFlat = menu?.style === "flat";

  // Breadcrumb: menus flat pulam o nível de categoria
  useBreadcrumbLabel(params.menuId, menu?.name);
  useBreadcrumbLabel(params.categoryId, isFlat ? undefined : category?.name);

  if (context.type !== "restaurant") {
    return (
      <Text variant="sm" muted>
        Selecione um restaurante.
      </Text>
    );
  }

  // Back: menus flat voltam direto para /menu; categorized voltam para categorias
  const backHref = isFlat
    ? `/menu${locationId ? `?locationId=${locationId}` : ""}`
    : `/menu/${params.menuId}${locationId ? `?locationId=${locationId}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <BackButton href={backHref} className="mt-1" />
        <div>
          <Text variant="h2">Produtos</Text>
          <Text variant="sm" muted className="mt-1">
            {isFlat
              ? `Gerencie os produtos de "${menu?.name ?? "..."}".`
              : "Crie e gerencie os produtos desta categoria."}
          </Text>
        </div>
      </div>

      <ProductList
        categoryId={params.categoryId}
        menuId={params.menuId}
        restaurantId={context.restaurantId}
        locationId={locationId}
        menuStyle={menu?.style ?? "categorized"}
      />
    </div>
  );
}
