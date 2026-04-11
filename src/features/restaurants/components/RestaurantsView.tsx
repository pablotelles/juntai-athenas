"use client";

import * as React from "react";
import { Building2, MapPin, Plus, UtensilsCrossed } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Button } from "@/components/primitives/button/Button";
import { Input } from "@/components/primitives/input/Input";
import { Text } from "@/components/primitives/text/Text";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/shared/modal/Modal";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/contexts/toast/ToastProvider";
import {
  useAllRestaurants,
  useCreateLocation,
  useCreateRestaurant,
  useLocations,
} from "@/features/restaurants/hooks";
import type { Restaurant } from "@/features/restaurants/types";
import { resolvePortalProfile } from "@/lib/access";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function getErrorDescription(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Tente novamente em alguns instantes.";
}

function RestaurantLocationsCell({ restaurantId }: { restaurantId: string }) {
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

interface RestaurantFormModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { name: string; slug: string }) => Promise<void>;
}

function RestaurantFormModal({
  open,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: RestaurantFormModalProps) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isTouched, setIsTouched] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setIsTouched(false);
      setSlugTouched(false);
    }
  }, [open]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  const normalizedName = name.trim();
  const normalizedSlug = slugify(slug);
  const nameError = normalizedName ? null : "Informe o nome do restaurante.";
  const slugError = normalizedSlug ? null : "Informe um slug válido.";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsTouched(true);

    if (nameError || slugError) {
      return;
    }

    await onSubmit({
      name: normalizedName,
      slug: normalizedSlug,
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Novo restaurante</ModalTitle>
            <ModalDescription>
              Cadastre uma nova operação principal para depois organizar suas
              filiais e unidades.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="restaurant-name">
              Nome do restaurante
            </label>
            <Input
              id="restaurant-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Ex.: Juntai Centro"
              error={Boolean(isTouched && nameError)}
            />
            {isTouched && nameError ? (
              <Text variant="sm" className="text-destructive">
                {nameError}
              </Text>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="restaurant-slug">
              Slug
            </label>
            <Input
              id="restaurant-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="juntai-centro"
              error={Boolean(isTouched && slugError)}
            />
            <Text variant="xs" muted className="block">
              Use apenas letras minúsculas, números e hífens.
            </Text>
            {isTouched && slugError ? (
              <Text variant="sm" className="text-destructive">
                {slugError}
              </Text>
            ) : null}
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Criar restaurante
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

interface LocationFormModalProps {
  open: boolean;
  restaurant: Restaurant | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    name: string;
    phone?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => Promise<void>;
}

function LocationFormModal({
  open,
  restaurant,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: LocationFormModalProps) {
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    country: "BR",
  });
  const [isTouched, setIsTouched] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        phone: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        postalCode: "",
        country: "BR",
      });
      setIsTouched(false);
    }
  }, [open]);

  const requiredFields = [
    form.name.trim(),
    form.street.trim(),
    form.number.trim(),
    form.neighborhood.trim(),
    form.city.trim(),
    form.state.trim(),
    form.postalCode.trim(),
  ];
  const hasMissingField = requiredFields.some((value) => value.length === 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsTouched(true);

    if (!restaurant || hasMissingField) {
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim() || undefined,
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      postalCode: form.postalCode.replace(/\D/g, "").slice(0, 8),
      country: (form.country.trim() || "BR").toUpperCase(),
    });
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Nova filial</ModalTitle>
            <ModalDescription>
              {restaurant
                ? `Cadastre uma nova unidade para ${restaurant.name}.`
                : "Cadastre uma nova unidade para o restaurante selecionado."}
            </ModalDescription>
          </ModalHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-name">
                Nome da filial
              </label>
              <Input
                id="location-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ex.: Unidade Paulista"
                error={Boolean(isTouched && !form.name.trim())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-phone">
                Telefone
              </label>
              <Input
                id="location-phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-postalCode">
                CEP
              </label>
              <Input
                id="location-postalCode"
                value={form.postalCode}
                onChange={(event) =>
                  updateField("postalCode", event.target.value)
                }
                placeholder="01310-100"
                error={Boolean(isTouched && !form.postalCode.trim())}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-street">
                Rua
              </label>
              <Input
                id="location-street"
                value={form.street}
                onChange={(event) => updateField("street", event.target.value)}
                placeholder="Av. Paulista"
                error={Boolean(isTouched && !form.street.trim())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-number">
                Número
              </label>
              <Input
                id="location-number"
                value={form.number}
                onChange={(event) => updateField("number", event.target.value)}
                placeholder="1000"
                error={Boolean(isTouched && !form.number.trim())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-complement">
                Complemento
              </label>
              <Input
                id="location-complement"
                value={form.complement}
                onChange={(event) =>
                  updateField("complement", event.target.value)
                }
                placeholder="Loja 2, térreo…"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-neighborhood">
                Bairro
              </label>
              <Input
                id="location-neighborhood"
                value={form.neighborhood}
                onChange={(event) =>
                  updateField("neighborhood", event.target.value)
                }
                placeholder="Bela Vista"
                error={Boolean(isTouched && !form.neighborhood.trim())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-city">
                Cidade
              </label>
              <Input
                id="location-city"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                placeholder="São Paulo"
                error={Boolean(isTouched && !form.city.trim())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-state">
                UF
              </label>
              <Input
                id="location-state"
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                placeholder="SP"
                maxLength={2}
                error={Boolean(isTouched && !form.state.trim())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="location-country">
                País
              </label>
              <Input
                id="location-country"
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
                placeholder="BR"
                maxLength={2}
              />
            </div>
          </div>

          {isTouched && hasMissingField ? (
            <Text variant="sm" className="text-destructive">
              Preencha os campos obrigatórios para cadastrar a filial.
            </Text>
          ) : null}

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Criar filial
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export function RestaurantsView() {
  const { data: restaurants, isLoading } = useAllRestaurants();
  const { restaurants: accessibleRestaurants } = useActiveContext();
  const { memberships } = useAuth();
  const { toast } = useToast();
  const profile = resolvePortalProfile(memberships);
  const [restaurantModalOpen, setRestaurantModalOpen] = React.useState(false);
  const [locationModalRestaurant, setLocationModalRestaurant] =
    React.useState<Restaurant | null>(null);

  const createRestaurantMutation = useCreateRestaurant();
  const createLocationMutation = useCreateLocation(locationModalRestaurant?.id ?? "");

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

  const canCreateRestaurant = profile === "platform-admin";
  const canCreateLocation =
    profile === "platform-admin" || profile === "owner";

  const columns: ColumnDef<Restaurant>[] = [
    {
      key: "name",
      header: "Restaurante",
      sortable: true,
      cell: (row) => (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium text-foreground">{row.name}</span>
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

  async function handleCreateRestaurant(values: {
    name: string;
    slug: string;
  }) {
    try {
      await createRestaurantMutation.mutateAsync({
        name: values.name,
        slug: values.slug,
        settings: {
          type: "RESTAURANT",
          allowAnonymous: true,
          requireApproval: false,
          currency: "BRL",
        },
      });
      setRestaurantModalOpen(false);
      toast.success("Restaurante criado com sucesso.");
    } catch (error) {
      toast.error("Não foi possível criar o restaurante.", {
        description: getErrorDescription(error),
      });
    }
  }

  async function handleCreateLocation(values: {
    name: string;
    phone?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) {
    if (!locationModalRestaurant) {
      return;
    }

    try {
      await createLocationMutation.mutateAsync({
        name: values.name,
        phone: values.phone,
        address: {
          street: values.street,
          number: values.number,
          complement: values.complement,
          neighborhood: values.neighborhood,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country,
          lat: undefined,
          lng: undefined,
        },
      });
      setLocationModalRestaurant(null);
      toast.success("Filial criada com sucesso.");
    } catch (error) {
      toast.error("Não foi possível criar a filial.", {
        description: getErrorDescription(error),
      });
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-primary" />
            <Text variant="sm" className="font-semibold text-foreground">
              Gestão de restaurantes e filiais
            </Text>
          </div>
          <Text variant="sm" muted>
            {canCreateRestaurant
              ? "Cadastre novos restaurantes e abra as primeiras filiais da operação."
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
      </div>

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
        onOpenChange={setRestaurantModalOpen}
        onSubmit={handleCreateRestaurant}
        isSubmitting={createRestaurantMutation.isPending}
      />

      <LocationFormModal
        open={Boolean(locationModalRestaurant)}
        restaurant={locationModalRestaurant}
        onOpenChange={(open) => {
          if (!open) {
            setLocationModalRestaurant(null);
          }
        }}
        onSubmit={handleCreateLocation}
        isSubmitting={createLocationMutation.isPending}
      />
    </>
  );
}
