"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useMenu } from "@/features/menu/hooks";
import { ProductBuilderPage } from "@/features/menu/components/ProductBuilder";

export default function EditProductPage() {
  return (
    <React.Suspense fallback={null}>
      <EditProductPageContent />
    </React.Suspense>
  );
}

function EditProductPageContent() {
  const { context } = useActiveContext();
  const params = useParams();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const productId = params.productId as string;
  const categoryId = searchParams.get("categoryId");
  const menuId = searchParams.get("menuId");
  const locationIdFromUrl = searchParams.get("locationId");

  if (!mounted) return null;

  if (context.type !== "restaurant") {
    return (
      <Text variant="sm" muted>
        Selecione um restaurante.
      </Text>
    );
  }

  if (!productId || !categoryId || !menuId) {
    return (
      <Text variant="sm" muted>
        Parâmetros inválidos.
      </Text>
    );
  }

  const locationId = locationIdFromUrl ?? context.locationId ?? null;
  const restaurantId = context.restaurantId;

  return (
    <EditProductLoader
      productId={productId}
      categoryId={categoryId}
      menuId={menuId}
      restaurantId={restaurantId}
      locationId={locationId}
    />
  );
}

function EditProductLoader({
  productId,
  categoryId,
  menuId,
  restaurantId,
  locationId,
}: {
  productId: string;
  categoryId: string;
  menuId: string;
  restaurantId: string;
  locationId: string | null;
}) {
  const { data: menus, isLoading } = useMenu(restaurantId, locationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const item = menus
    ?.find((m) => m.id === menuId)
    ?.categories.find((c) => c.id === categoryId)
    ?.items.find((i) => i.id === productId);

  if (!item) {
    return (
      <Text variant="sm" muted>
        Produto não encontrado.
      </Text>
    );
  }

  return (
    <ProductBuilderPage
      categoryId={categoryId}
      menuId={menuId}
      restaurantId={restaurantId}
      locationId={locationId}
      backHref={`/menu/${menuId}/${categoryId}${locationId ? `?locationId=${locationId}` : ""}`}
      initialItem={item}
    />
  );
}
