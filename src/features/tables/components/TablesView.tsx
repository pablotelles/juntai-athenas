"use client";

import * as React from "react";
import {
  ArrowRightLeft,
  CalendarClock,
  LayoutGrid,
  Plus,
  QrCode,
  ReceiptText,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  Subheader,
  SubheaderGroup,
} from "@/components/compositions/subheader/Subheader";
import { ActionSheet } from "@/components/primitives/action-sheet/ActionSheet";
import { Button } from "@/components/primitives/button/Button";
import { FAB } from "@/components/primitives/fab/FAB";
import { cn } from "@/lib/cn";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
import {
  MobileSubheader,
  useMobileSubheaderOffset,
} from "@/components/primitives/mobile-subheader/MobileSubheader";
import { SearchInput } from "@/components/primitives/search-input/SearchInput";
import { Text } from "@/components/primitives/text/Text";
import { useActiveContext } from "@/contexts/active-context/ActiveContextProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useToast } from "@/contexts/toast/ToastProvider";
import { LocationPicker } from "@/features/restaurants/components/LocationPicker";
import { useLocations } from "@/features/restaurants/hooks";
import {
  useCloseTableSession,
  useConnectTable,
  useTables,
} from "@/features/tables/hooks";
import {
  getMesaStatusCounts,
  mapTableToMesa,
  MESA_STATUS_LABELS,
  type Mesa,
  type MesaFilterValue,
} from "@/features/tables/model";
import { MesaCard } from "./MesaCard";
import { MesaFilterSheet } from "./MesaFilterSheet";
import { MesaGrid } from "./MesaGrid";
import { MesaQrModal } from "./MesaQrModal";

const FILTERS: MesaFilterValue[] = [
  "todas",
  "livre",
  "ocupada",
  "reservada",
  "inativa",
];

interface TablesViewProps {
  restaurantId: string;
}

function mergeMesas(previous: Mesa[], next: Mesa[]) {
  return next.map((mesa) => {
    const current = previous.find((item) => item.id === mesa.id);
    if (!current) return mesa;

    return {
      ...mesa,
      status: current.status,
      pessoasConectadas: current.pessoasConectadas,
      reserva: current.reserva,
      ocupacaoInicio: current.ocupacaoInicio,
      sessionId: current.sessionId ?? mesa.sessionId,
    };
  });
}

export function TablesView({ restaurantId }: TablesViewProps) {
  const { context, setLocationId: persistLocationId } = useActiveContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const subheaderOffset = useMobileSubheaderOffset();

  const { data: locations } = useLocations(restaurantId);
  const [locationId, setLocationId] = React.useState<string | null>(
    context.type === "restaurant" ? context.locationId ?? null : null,
  );
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<MesaFilterValue>("todas");
  const [mesas, setMesas] = React.useState<Mesa[]>([]);
  const [qrMesa, setQrMesa] = React.useState<Mesa | null>(null);
  const [actionMesa, setActionMesa] = React.useState<Mesa | null>(null);
  const [isFilterSheetOpen, setFilterSheetOpen] = React.useState(false);

  React.useEffect(() => {
    if (!locations?.length) return;

    const storedLocationId =
      context.type === "restaurant" ? context.locationId ?? null : null;
    const candidates = [locationId, storedLocationId].filter(Boolean) as string[];
    const nextLocationId =
      candidates.find((candidate) =>
        locations.some((location) => location.id === candidate),
      ) ?? locations[0]?.id ?? null;

    if (nextLocationId && nextLocationId !== locationId) {
      setLocationId(nextLocationId);
    }
    if (nextLocationId && nextLocationId !== storedLocationId) {
      persistLocationId(nextLocationId);
    }
  }, [context, locationId, locations, persistLocationId]);

  const { data: tables, isLoading } = useTables(restaurantId, locationId);
  const connectTable = useConnectTable();
  const closeTableSession = useCloseTableSession();

  React.useEffect(() => {
    const nextMesas = (tables ?? []).map((table, index) => mapTableToMesa(table, index));
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

  const handleLocationChange = React.useCallback(
    (nextLocationId: string) => {
      setLocationId(nextLocationId);
      persistLocationId(nextLocationId);
    },
    [persistLocationId],
  );

  const handleViewOrder = React.useCallback(
    (mesa: Mesa) => {
      toast.info(`Abrindo comanda da ${mesa.nome}`, {
        description: "Fluxo de comanda rápida preparado para integração.",
      });
    },
    [toast],
  );

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

  const handleToggleOccupancy = React.useCallback(
    (mesa: Mesa) => {
      if (mesa.status === "ocupada") {
        const releaseMesa = (description: string) => {
          updateMesa(mesa.id, (current) => ({
            ...current,
            status: "livre",
            pessoasConectadas: 0,
            ocupacaoInicio: null,
            reserva: undefined,
            sessionId: null,
          }));
          toast.success(`Mesa liberada: ${mesa.nome}`, { description });
        };

        if (mesa.sessionId) {
          closeTableSession.mutate(
            { sessionId: mesa.sessionId, restaurantId },
            {
              onSuccess: () =>
                releaseMesa("A sessão foi encerrada e a mesa voltou a ficar livre."),
              onError: () =>
                releaseMesa("Sessão finalizada localmente para continuar o fluxo."),
            },
          );
          return;
        }

        releaseMesa("A mesa voltou a ficar disponível para novos clientes.");
        return;
      }

      updateMesa(mesa.id, (current) => ({
        ...current,
        status: "ocupada",
        pessoasConectadas: Math.max(1, current.pessoasConectadas),
        ocupacaoInicio: current.ocupacaoInicio ?? new Date().toISOString(),
        reserva: undefined,
      }));

      toast.success(`Mesa ocupada: ${mesa.nome}`, {
        description: "Atendimento iniciado com sucesso.",
      });
    },
    [closeTableSession, restaurantId, toast, updateMesa],
  );

  const handleConnect = React.useCallback(
    (mesa: Mesa) => {
      const applyConnectionState = (sessionId: string | null) => {
        updateMesa(mesa.id, (current) => ({
          ...current,
          status: "ocupada",
          pessoasConectadas: Math.min(
            current.capacidade,
            Math.max(1, current.pessoasConectadas + 1),
          ),
          ocupacaoInicio: current.ocupacaoInicio ?? new Date().toISOString(),
          reserva: undefined,
          sessionId: sessionId ?? current.sessionId ?? null,
        }));
      };

      connectTable.mutate(
        {
          qrCodeToken: mesa.qrCodeToken,
          displayName: user?.name ?? user?.email ?? "Convidado",
        },
        {
          onSuccess: ({ session }) => {
            applyConnectionState(session.id);
            toast.success(`Usuário conectado à mesa ${mesa.nome}`);
          },
          onError: () => {
            applyConnectionState(mesa.sessionId ?? null);
            toast.info(`Usuário conectado à mesa ${mesa.nome}`, {
              description: "Conexão simulada localmente para o fluxo de QR.",
            });
          },
        },
      );
    },
    [connectTable, toast, updateMesa, user?.email, user?.name],
  );

  const handleCloseBill = React.useCallback(
    (mesa: Mesa) => {
      const finish = (description: string) => {
        updateMesa(mesa.id, (current) => ({
          ...current,
          status: "livre",
          pessoasConectadas: 0,
          ocupacaoInicio: null,
          reserva: undefined,
          sessionId: null,
        }));
        toast.success(`Conta fechada: ${mesa.nome}`, { description });
      };

      if (mesa.sessionId) {
        closeTableSession.mutate(
          { sessionId: mesa.sessionId, restaurantId },
          {
            onSuccess: () => finish("Atendimento encerrado e mesa pronta para o próximo giro."),
            onError: () => finish("Fechamento concluído localmente para manter a operação fluindo."),
          },
        );
        return;
      }

      finish("Atendimento encerrado e mesa pronta para o próximo giro.");
    },
    [closeTableSession, restaurantId, toast, updateMesa],
  );

  const currentLocationName =
    locations?.find((location) => location.id === locationId)?.name ?? "Filial";

  const filteredMesas = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return mesas.filter((mesa) => {
      const matchesFilter = filter === "todas" || mesa.status === filter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        mesa.nome.toLowerCase().includes(normalizedSearch);
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
    ];
  }, [actionMesa, handleCloseBill, handleReserve, handleToggleOccupancy, handleTransfer, handleViewOrder]);

  return (
    <div className={cn("flex flex-col gap-4 lg:gap-6", subheaderOffset)}>
      <div className="hidden lg:block">
        <Subheader>
          <SubheaderGroup>
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
          </SubheaderGroup>

          <div className="flex items-center gap-2">
            <LocationPicker
              restaurantId={restaurantId}
              value={locationId}
              onChange={handleLocationChange}
            />
            <Button
              variant="outline"
              onClick={() => setFilterSheetOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </Subheader>
      </div>

      <MobileSubheader>
        <div className="flex flex-col gap-3 lg:hidden">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar mesas"
          />
          <div className="flex items-center gap-2">
            <LocationPicker
              restaurantId={restaurantId}
              value={locationId}
              onChange={handleLocationChange}
              triggerClassName="w-full"
            />
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

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface/70 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text variant="body" className="font-semibold">
            {filteredMesas.length} de {mesas.length} mesas · {currentLocationName}
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
      </div>

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
                  Ajuste os filtros ou selecione outra filial para visualizar o salão.
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
              onViewOrder={handleViewOrder}
              onMore={setActionMesa}
            />
          ))}
        </MesaGrid>
      )}

      <MesaFilterSheet
        open={isFilterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        value={filter}
        onChange={setFilter}
        counts={counts}
      />

      <ActionSheet
        open={!!actionMesa}
        onClose={() => setActionMesa(null)}
        title={actionMesa ? `Ações · ${actionMesa.nome}` : "Ações da mesa"}
        items={actionItems}
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
        onClick={() => {
          toast.info("Cadastro rápido de mesa", {
            description: "O botão já está pronto para conectar com o fluxo de criação.",
          });
        }}
      />
    </div>
  );
}
