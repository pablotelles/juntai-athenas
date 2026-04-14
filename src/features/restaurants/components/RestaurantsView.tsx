"use client";

import * as React from "react";
import { Building2, Plus, UtensilsCrossed } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/contexts/toast/ToastProvider";
import {
  useAllRestaurants,
  useCreateLocation,
  useCreateRestaurant,
} from "@/features/restaurants/hooks";
import type { Restaurant } from "@/features/restaurants/types";
import { resolvePortalProfile } from "@/lib/access";
import { Card, CardContent } from "@/components/shared/card/Card";
import type { LocationFormValues, RestaurantFormValues } from "../schemas";
import { LocationFormModal } from "./LocationFormModal";
import { RestaurantFormModal } from "./RestaurantFormModal";
import { RestaurantLocationsCell } from "./RestaurantLocationsCell";

function getErrorDescription(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Tente novamente em alguns instantes.";
}

export function RestaurantsView() {
  const { data: restaurants, isLoading } = useAllRestaurants();
  const { context, restaurants: accessibleRestaurants } = useActiveContext();
  const { memberships, user } = useAuth();
  const { toast } = useToast();
  const restaurantId =
    context.type === "restaurant" ? context.restaurantId : undefined;
  const profile = resolvePortalProfile(memberships, context.type, restaurantId);
  const [restaurantModalOpen, setRestaurantModalOpen] = React.useState(false);
  const [locationModalRestaurant, setLocationModalRestaurant] =
    React.useState<Restaurant | null>(null);

  const createRestaurantMutation = useCreateRestaurant();
  const createLocationMutation = useCreateLocation(
    locationModalRestaurant?.id ?? "",
  );

  const accessibleIds = React.useMemo(
    () => new Set(accessibleRestaurants.map((restaurant) => restaurant.id)),
    [accessibleRestaurants],
  );

  const visibleRestaurants = React.useMemo(() => {
    const list = restaurants ?? [];
    const filtered =
      profile === "platform-admin"
        ? list
        : list.filter((restaurant) => accessibleIds.has(restaurant.id));

    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [accessibleIds, profile, restaurants]);

  const canCreateRestaurant =
    profile === "platform-admin" || profile === "owner";
  const canCreateLocation = profile === "platform-admin" || profile === "owner";

  const columns: ColumnDef<Restaurant>[] = [
    {
      key: "name",
      header: "Restaurante",
      sortable: true,
      cell: (row) => (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium text-foreground">
            {row.name}
          </span>
          <Text variant="xs" muted className="block">
            ID: {row.id}
          </Text>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      cell: (row) => (
        <code className="text-xs font-mono text-muted-foreground">
          {row.slug}
        </code>
      ),
    },
    {
      key: "locations",
      header: "Filiais",
      cell: (row) => <RestaurantLocationsCell restaurantId={row.id} />,
    },
    {
      key: "createdAt",
      header: "Criado em",
      cell: (row) => (
        <Text variant="xs" muted>
          {new Date(row.createdAt).toLocaleDateString("pt-BR")}
        </Text>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      align: "right",
      cell: (row) =>
        canCreateLocation ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLocationModalRestaurant(row)}
          >
            <Plus size={14} />
            Nova filial
          </Button>
        ) : (
          <Text variant="xs" muted>
            Somente admin/owner
          </Text>
        ),
    },
  ];

  async function handleCreateRestaurant(values: RestaurantFormValues) {
    try {
      await createRestaurantMutation.mutateAsync({
        name: values.name,
        slug: values.slug,
        ownerUserId: values.ownerUserId || undefined,
        settings: {
          type: "RESTAURANT",
          allowAnonymous: true,
          requireApproval: false,
          currency: "BRL",
        },
      });
      toast.success("Restaurante criado com sucesso.");
    } catch (error) {
      toast.error("Não foi possível criar o restaurante.", {
        description: getErrorDescription(error),
      });
      throw error;
    }
  }

  async function handleCreateLocation(values: LocationFormValues) {
    if (!locationModalRestaurant) return;

    try {
      await createLocationMutation.mutateAsync({
        name: values.name,
        phone: values.phone || undefined,
        address: {
          street: values.street,
          number: values.number,
          complement: values.complement || undefined,
          neighborhood: values.neighborhood,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          lat: undefined,
          lng: undefined,
        },
      });
      toast.success("Filial criada com sucesso.");
    } catch (error) {
      toast.error("Não foi possível criar a filial.", {
        description: getErrorDescription(error),
      });
      throw error;
    }
  }

  return (
    <>
      <Card className="mb-4 rounded-2xl">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-primary" />
              <Text variant="sm" className="font-semibold text-foreground">
                Gestão de restaurantes e filiais
              </Text>
            </div>
            <Text variant="sm" muted>
              {canCreateRestaurant
                ? "Cadastre novos restaurantes, defina o owner responsável e abra as primeiras filiais da operação."
                : canCreateLocation
                  ? "Acompanhe suas unidades e abra novas filiais quando necessário."
                  : "Consulte os restaurantes e filiais disponíveis para a sua operação."}
            </Text>
          </div>

          {canCreateRestaurant ? (
            <Button onClick={() => setRestaurantModalOpen(true)}>
              <Plus size={16} />
              Novo restaurante
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <DataTable
        data={visibleRestaurants}
        columns={columns}
        isLoading={isLoading}
        emptyState={
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <UtensilsCrossed size={32} className="opacity-40" />
            <Text variant="sm">
              {canCreateRestaurant
                ? "Nenhum restaurante cadastrado ainda."
                : "Nenhum restaurante disponível para o seu perfil."}
            </Text>
            {canCreateRestaurant ? (
              <Button size="sm" onClick={() => setRestaurantModalOpen(true)}>
                <Plus size={14} />
                Criar primeiro restaurante
              </Button>
            ) : null}
          </div>
        }
      />

      <RestaurantFormModal
        open={restaurantModalOpen}
        canChooseOwner={profile === "platform-admin"}
        currentUser={
          user ? { id: user.id, name: user.name, email: user.email } : null
        }
        onOpenChange={setRestaurantModalOpen}
        onSubmit={handleCreateRestaurant}
      />

      <LocationFormModal
        open={Boolean(locationModalRestaurant)}
        restaurant={locationModalRestaurant}
        onOpenChange={(open) => {
          if (!open) setLocationModalRestaurant(null);
        }}
        onSubmit={handleCreateLocation}
      />
    </>
  );
}
