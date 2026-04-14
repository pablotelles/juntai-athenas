"use client";

import { Suspense, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Text } from "@/components/primitives/text/Text";
import { BackButton } from "@/components/primitives/back-button/BackButton";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { CategoryList } from "@/features/menu/components/CategoryList";
import { useMenu } from "@/features/menu/hooks";
import { useBreadcrumbLabel } from "@/contexts/breadcrumb/BreadcrumbProvider";

export default function MenuCategoriesPage() {
  return (
    <Suspense fallback={null}>
      <MenuCategoriesPageContent />
    </Suspense>
  );
}

function MenuCategoriesPageContent() {
  const { context } = useActiveContext();
  const params = useParams<{ menuId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locationIdFromUrl = searchParams.get("locationId");
  const locationId =
    locationIdFromUrl ??
    (context.type === "restaurant" ? (context.locationId ?? null) : null);

  const restaurantId =
    context.type === "restaurant" ? context.restaurantId : null;
  const { data: menus, isLoading } = useMenu(restaurantId ?? "", locationId);
  const menu = menus?.find((m) => m.id === params.menuId);
  useBreadcrumbLabel(params.menuId, menu?.name);

  // Guard: menus flat não têm página de categorias — redirecionar direto para os itens
  useEffect(() => {
    if (isLoading || !menu) return;
    if (menu.style === "flat") {
      const defaultCategory = menu.categories[0];
      if (defaultCategory) {
        const locQuery = locationId ? `?locationId=${locationId}` : "";
        router.replace(`/menu/${params.menuId}/${defaultCategory.id}${locQuery}`);
      }
    }
  }, [menu, isLoading, params.menuId, locationId, router]);

  if (context.type !== "restaurant") {
    return (
      <Text variant="sm" muted>
        Selecione um restaurante.
      </Text>
    );
  }

  // Mostrar spinner enquanto carrega ou redireciona (menu flat)
  if (isLoading || menu?.style === "flat") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
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
