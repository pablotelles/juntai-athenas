"use client";

import * as React from "react";
import {
  ArrowRightLeft,
  CalendarClock,
  LayoutGrid,
  Pencil,
  Plus,
  QrCode,
  ReceiptText,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ActionSheet } from "@/components/primitives/action-sheet/ActionSheet";
import { Button } from "@/components/primitives/button/Button";
import { FAB } from "@/components/primitives/fab/FAB";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
import { cn } from "@/lib/cn";
import {
  MobileSubheader,
  useMobileSubheaderOffset,
} from "@/components/primitives/mobile-subheader/MobileSubheader";
import { SearchInput } from "@/components/primitives/search-input/SearchInput";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useLocations } from "@/features/restaurants/hooks";
import {
  useCloseTableSession,
  useConnectTable,
  useCreateTable,
  useDeleteTable,
  useTables,
  useUpdateTable,
} from "@/features/tables/hooks";
import {
  getMesaStatusCounts,
  mapTableToMesa,
  MESA_STATUS_LABELS,
  type Mesa,
  type MesaFilterValue,
} from "@/features/tables/model";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { Card, CardContent } from "@/components/shared/card/Card";
import { MesaCard } from "./MesaCard";
import { MesaFilterSheet } from "./MesaFilterSheet";
import { MesaFormModal } from "./MesaFormModal";
import { MesaGrid } from "./MesaGrid";
import { MesaModal } from "./MesaModal";
import { MesaQrModal } from "./MesaQrModal";
import { useLocationChannel } from "@/hooks/useLocationChannel";

const FILTERS: MesaFilterValue[] = [
  "todas",
  "livre",
  "ocupada",
  "reservada",
  "inativa",
];

interface TablesViewProps {
  restaurantId: string;
  /** Override do locationId (ex: painel de teste). Usa contexto ativo se omitido. */
  locationId?: string | null;
  showToolbar?: boolean;
}

function mergeMesas(previous: Mesa[], next: Mesa[]) {
  return next.map((mesa) => {
    const current = previous.find((item) => item.id === mesa.id);
    if (!current) return mesa;

    if (
      current.status === "reservada" &&
      current.reserva &&
      mesa.status === "livre"
    ) {
      return {
        ...mesa,
        status: "reservada" as const,
        reserva: current.reserva,
      };
    }

    return mesa;
  });
}

function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("TABLE_LABEL_ALREADY_EXISTS")) {
      return "Já existe uma mesa com esse nome nesta filial.";
    }
    if (error.message.includes("LOCATION_REQUIRED")) {
      return "Selecione uma filial antes de continuar.";
    }
    return error.message;
  }

  return "Tente novamente em instantes.";
}

export function TablesView({
  restaurantId,
  locationId: locationIdProp,
  showToolbar = true,
}: TablesViewProps) {
  const { context } = useActiveContext();
  const { user, sessionToken } = useAuth();
  const { toast } = useToast();
  const subheaderOffset = useMobileSubheaderOffset();

  const locationFromContext =
    context.type === "restaurant" ? (context.locationId ?? null) : null;
  const locationId =
    locationIdProp !== undefined ? locationIdProp : locationFromContext;

  useLocationChannel({ locationId, restaurantId, token: sessionToken });

  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<MesaFilterValue>("todas");
  const [mesas, setMesas] = React.useState<Mesa[]>([]);
  const [qrMesa, setQrMesa] = React.useState<Mesa | null>(null);
  const [actionMesa, setActionMesa] = React.useState<Mesa | null>(null);
  const [detailMesa, setDetailMesa] = React.useState<Mesa | null>(null);
  const [editingMesa, setEditingMesa] = React.useState<Mesa | null>(null);
  const [deleteMesa, setDeleteMesa] = React.useState<Mesa | null>(null);
  const [isFilterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [isFormOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");

  const { data: tables, isLoading } = useTables(restaurantId, locationId);
  const createTable = useCreateTable(restaurantId, locationId);
  const updateTable = useUpdateTable(restaurantId, locationId);
  const deleteTable = useDeleteTable(restaurantId, locationId);
  const connectTable = useConnectTable();
  const closeTableSession = useCloseTableSession();

  React.useEffect(() => {
    const nextMesas = (tables ?? []).map((table) => mapTableToMesa(table));
    setMesas((current) => mergeMesas(current, nextMesas));
  }, [tables]);

  const updateMesa = React.useCallback(
    (mesaId: string, updater: (mesa: Mesa) => Mesa) => {
      setMesas((current) =>
        current.map((mesa) => (mesa.id === mesaId ? updater(mesa) : mesa)),
      );
    },
    [],
  );

  const handleOpenCreate = React.useCallback(() => {
    if (!locationId) {
      toast.warning("Selecione uma filial antes de criar uma mesa.");
      return;
    }
    setFormMode("create");
    setEditingMesa(null);
    setFormOpen(true);
  }, [locationId, toast]);

  const handleOpenEdit = React.useCallback((mesa: Mesa) => {
    setFormMode("edit");
    setEditingMesa(mesa);
    setActionMesa(null);
    setFormOpen(true);
  }, []);

  const handleViewOrder = React.useCallback((mesa: Mesa) => {
    setActionMesa(null);
    setDetailMesa(mesa);
  }, []);

  const handleTransfer = React.useCallback(
    (mesa: Mesa) => {
      toast.info(`Transferência da ${mesa.nome}`, {
        description: "Seleção de destino será conectada ao fluxo de salão.",
      });
    },
    [toast],
  );

  const handleReserve = React.useCallback(
    (mesa: Mesa) => {
      const reserveName = user?.name ?? "Reserva manual";
      const reserveTime = new Date(Date.now() + 45 * 60 * 1000).toISOString();

      updateMesa(mesa.id, (current) => ({
        ...current,
        status: "reservada",
        pessoasConectadas: 0,
        ocupacaoInicio: null,
        reserva: {
          nomeCliente: reserveName,
          horario: reserveTime,
          telefone: user?.email ?? undefined,
        },
      }));

      toast.success(`Mesa reservada: ${mesa.nome}`, {
        description: `Reserva criada para ${reserveName}.`,
      });
    },
    [toast, updateMesa, user?.email, user?.name],
  );

  const handleConnect = React.useCallback(
    (mesa: Mesa) => {
      connectTable.mutate(
        { qrCodeToken: mesa.qrCodeToken },
        {
          onSuccess: ({ session }) => {
            updateMesa(mesa.id, (current) => ({
              ...current,
              status: "ocupada",
              ocupacaoInicio:
                current.ocupacaoInicio ?? new Date().toISOString(),
              reserva: undefined,
              sessionId: session.id,
            }));
            toast.success(`Mesa ${mesa.nome} ocupada`);
          },
          onError: (error) => {
            toast.error(`Não foi possível ocupar a ${mesa.nome}`, {
              description: getFriendlyErrorMessage(error),
            });
          },
        },
      );
    },
    [connectTable, toast, updateMesa],
  );

  const handleToggleOccupancy = React.useCallback(
    (mesa: Mesa) => {
      if (mesa.status === "ocupada") {
        if (!mesa.sessionId) {
          toast.warning(
            `A ${mesa.nome} não possui uma sessão ativa para encerrar.`,
          );
          return;
        }

        closeTableSession.mutate(
          { sessionId: mesa.sessionId, restaurantId },
          {
            onSuccess: () => {
              updateMesa(mesa.id, (current) => ({
                ...current,
                status: "livre",
                pessoasConectadas: 0,
                ocupacaoInicio: null,
                reserva: undefined,
                sessionId: null,
              }));
              toast.success(`Mesa liberada: ${mesa.nome}`, {
                description:
                  "A sessão foi encerrada e a mesa voltou a ficar livre.",
              });
            },
            onError: (error) => {
              toast.error(`Não foi possível liberar ${mesa.nome}`, {
                description: getFriendlyErrorMessage(error),
              });
            },
          },
        );
        return;
      }

      handleConnect(mesa);
    },
    [closeTableSession, handleConnect, restaurantId, toast, updateMesa],
  );

  const handleCloseBill = React.useCallback(
    (mesa: Mesa) => {
      if (!mesa.sessionId) {
        toast.warning(`A ${mesa.nome} ainda não possui uma sessão aberta.`);
        return;
      }

      closeTableSession.mutate(
        { sessionId: mesa.sessionId, restaurantId },
        {
          onSuccess: () => {
            updateMesa(mesa.id, (current) => ({
              ...current,
              status: "livre",
              pessoasConectadas: 0,
              ocupacaoInicio: null,
              reserva: undefined,
              sessionId: null,
            }));
            setDetailMesa((current) =>
              current?.id === mesa.id
                ? {
                    ...current,
                    status: "livre",
                    pessoasConectadas: 0,
                    ocupacaoInicio: null,
                    reserva: undefined,
                    sessionId: null,
                  }
                : current,
            );
            toast.success(`Conta fechada: ${mesa.nome}`, {
              description:
                "Atendimento encerrado e mesa pronta para o próximo giro.",
            });
          },
          onError: (error) => {
            toast.error(`Não foi possível fechar a conta da ${mesa.nome}`, {
              description: getFriendlyErrorMessage(error),
            });
          },
        },
      );
    },
    [closeTableSession, restaurantId, toast, updateMesa],
  );

  const handleFormSubmit = React.useCallback(
    async (payload: {
      label: string;
      capacity?: number | null;
      area?: string | null;
      isActive?: boolean;
    }) => {
      try {
        if (formMode === "create") {
          const created = await createTable.mutateAsync(payload);
          setMesas((current) => [...current, mapTableToMesa(created)]);
          toast.success(`Mesa criada: ${payload.label}`);
        } else if (editingMesa) {
          const updated = await updateTable.mutateAsync({
            tableId: editingMesa.id,
            body: payload,
          });
          setMesas((current) =>
            current.map((mesa) =>
              mesa.id === editingMesa.id ? mapTableToMesa(updated) : mesa,
            ),
          );
          toast.success(`Mesa atualizada: ${payload.label}`);
        }

        setFormOpen(false);
        setEditingMesa(null);
      } catch (error) {
        toast.error("Não foi possível salvar a mesa", {
          description: getFriendlyErrorMessage(error),
        });
      }
    },
    [createTable, editingMesa, formMode, toast, updateTable],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteMesa) return;

    try {
      await deleteTable.mutateAsync(deleteMesa.id);
      setMesas((current) =>
        current.filter((mesa) => mesa.id !== deleteMesa.id),
      );
      toast.success(`Mesa excluída: ${deleteMesa.nome}`);
      setDeleteMesa(null);
      setActionMesa(null);
    } catch (error) {
      toast.error(`Não foi possível excluir ${deleteMesa.nome}`, {
        description: getFriendlyErrorMessage(error),
      });
    }
  }, [deleteMesa, deleteTable, toast]);

  const { data: locations } = useLocations(restaurantId);
  const currentLocationName =
    locations?.find((loc) => loc.id === locationId)?.name ?? "Filial";

  const filteredMesas = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return mesas.filter((mesa) => {
      const matchesFilter = filter === "todas" || mesa.status === filter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        mesa.nome.toLowerCase().includes(normalizedSearch) ||
        (mesa.area ?? "").toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, mesas, search]);

  const counts = React.useMemo(() => getMesaStatusCounts(mesas), [mesas]);

  const actionItems = React.useMemo(() => {
    if (!actionMesa) return [];

    return [
      {
        key: "toggle",
        label: actionMesa.status === "ocupada" ? "Liberar mesa" : "Ocupar mesa",
        description: "Atualize rapidamente o status operacional.",
        icon: <Sparkles className="h-4 w-4" />,
        onSelect: () => handleToggleOccupancy(actionMesa),
      },
      {
        key: "edit",
        label: "Editar mesa",
        description: "Renomear, ajustar capacidade, área e status.",
        icon: <Pencil className="h-4 w-4" />,
        onSelect: () => handleOpenEdit(actionMesa),
      },
      {
        key: "order",
        label: "Ver comanda",
        description: "Acompanhar itens, consumo e próximos passos.",
        icon: <ReceiptText className="h-4 w-4" />,
        onSelect: () => handleViewOrder(actionMesa),
      },
      {
        key: "close-bill",
        label: "Fechar conta",
        description: "Encerrar atendimento e liberar a mesa.",
        icon: <Sparkles className="h-4 w-4" />,
        onSelect: () => handleCloseBill(actionMesa),
      },
      {
        key: "transfer",
        label: "Transferir mesa",
        description: "Mover atendimento para outro ponto do salão.",
        icon: <ArrowRightLeft className="h-4 w-4" />,
        onSelect: () => handleTransfer(actionMesa),
      },
      {
        key: "reserve",
        label: "Reservar mesa",
        description: "Agendar a próxima chegada com um toque.",
        icon: <CalendarClock className="h-4 w-4" />,
        onSelect: () => handleReserve(actionMesa),
      },
      {
        key: "qr",
        label: "Gerar QR Code",
        description: "Abrir QR ampliado e baixar o arquivo.",
        icon: <QrCode className="h-4 w-4" />,
        onSelect: () => setQrMesa(actionMesa),
      },
      {
        key: "delete",
        label: "Excluir mesa",
        description: "Remove a mesa da listagem desta filial.",
        icon: <Trash2 className="h-4 w-4" />,
        tone: "destructive" as const,
        onSelect: () => setDeleteMesa(actionMesa),
      },
    ];
  }, [
    actionMesa,
    handleCloseBill,
    handleOpenEdit,
    handleReserve,
    handleToggleOccupancy,
    handleTransfer,
    handleViewOrder,
  ]);

  return (
    <div className={cn("flex flex-col gap-4 lg:gap-6", subheaderOffset)}>
      {showToolbar ? (
        <>
          <div className="hidden lg:block">
            <Card className="flex flex-col gap-3  bg-surface/90 p-3 shadow-sm backdrop-blur sm:p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="min-w-72 flex-1">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar mesa por nome ou área"
                  />
                </div>
                {FILTERS.map((option) => (
                  <FilterChip
                    key={option}
                    active={filter === option}
                    count={counts[option]}
                    onClick={() => setFilter(option)}
                  >
                    {MESA_STATUS_LABELS[option]}
                  </FilterChip>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setFilterSheetOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </Button>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4" />
                  Nova mesa
                </Button>
              </div>
            </Card>
          </div>

          <MobileSubheader>
            <div className="flex flex-col gap-3 lg:hidden">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar mesas"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setFilterSheetOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </div>
          </MobileSubheader>
        </>
      ) : null}

      <Card className="bg-surface/70">
        <CardContent className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Text variant="body" className="font-semibold">
              {filteredMesas.length} de {mesas.length} mesas ·{" "}
              {currentLocationName}
            </Text>
            <Text variant="sm" muted>
              Status em tempo real para operação do salão e conexão via QR.
            </Text>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Text variant="sm" muted>
              Livre: {counts.livre}
            </Text>
            <Text variant="sm" muted>
              Ocupada: {counts.ocupada}
            </Text>
            <Text variant="sm" muted>
              Reservada: {counts.reservada}
            </Text>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <MesaGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-3xl border border-border bg-secondary/40"
            />
          ))}
        </MesaGrid>
      ) : (
        <MesaGrid
          isEmpty={filteredMesas.length === 0}
          emptyState={
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface px-6 py-12 text-center">
              <LayoutGrid className="h-10 w-10 text-muted-foreground/60" />
              <div className="space-y-1">
                <Text variant="h4">Nenhuma mesa encontrada</Text>
                <Text variant="sm" muted>
                  Ajuste os filtros ou selecione outra filial para visualizar o
                  salão.
                </Text>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilter("todas");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          }
        >
          {filteredMesas.map((mesa) => (
            <MesaCard
              key={mesa.id}
              mesa={mesa}
              onToggleOccupancy={handleToggleOccupancy}
              onOpenQr={setQrMesa}
              onConnect={handleConnect}
              onEdit={handleOpenEdit}
              onViewOrder={handleViewOrder}
              onMore={setActionMesa}
            />
          ))}
        </MesaGrid>
      )}

      {showToolbar ? (
        <MesaFilterSheet
          open={isFilterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          value={filter}
          onChange={setFilter}
          counts={counts}
        />
      ) : null}

      <ActionSheet
        open={!!actionMesa}
        onClose={() => setActionMesa(null)}
        title={actionMesa ? `Ações · ${actionMesa.nome}` : "Ações da mesa"}
        items={actionItems}
      />

      <MesaFormModal
        open={isFormOpen}
        mode={formMode}
        mesa={editingMesa}
        existingMesas={mesas}
        currentLocationName={currentLocationName}
        isSubmitting={createTable.isPending || updateTable.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMesa(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDeleteModal
        open={!!deleteMesa}
        mesa={deleteMesa}
        isDeleting={deleteTable.isPending}
        onOpenChange={(open) => {
          if (!open) setDeleteMesa(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <MesaModal
        mesa={detailMesa}
        restaurantId={restaurantId}
        onClose={() => setDetailMesa(null)}
        onCloseBill={(mesa) => {
          handleCloseBill(mesa);
          setDetailMesa(null);
        }}
        onTransfer={handleTransfer}
      />

      <MesaQrModal
        mesa={qrMesa}
        open={!!qrMesa}
        onOpenChange={(open) => {
          if (!open) setQrMesa(null);
        }}
        onSimulateConnection={handleConnect}
      />

      <FAB
        label="Nova mesa"
        icon={<Plus className="h-5 w-5" />}
        onClick={handleOpenCreate}
      />
    </div>
  );
}
