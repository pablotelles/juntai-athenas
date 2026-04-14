"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Trash2, XCircle } from "lucide-react";
import { RestaurantCombobox } from "@/components/shared/restaurant-combobox/RestaurantCombobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/select/Select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/card/Card";
import { Button } from "@/components/primitives/button/Button";
import { Input } from "@/components/primitives/input/Input";
import { Badge, type BadgeVariant } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useLocations } from "@/features/restaurants/hooks";
import { useTables, useGuestJoinSession } from "@/features/tables/hooks";
import { useLocationChannel } from "@/hooks/useLocationChannel";
import { type WsStatus } from "@/hooks/useWebSocket";
import { cn } from "@/lib/cn";
import type { RealtimeEnvelope } from "@juntai/types";
import { TablesView } from "@/features/tables/components/TablesView";
import { GuestSessionView } from "@/features/tables/components/GuestSessionView";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SimulatedClient {
  localId: string;
  token: string;
  userId: string;
  memberId: string;
  displayName: string;
  email: string;
  joinedAt: string;
}

interface LogEntry {
  id: string;
  channel: "session" | "location";
  envelope: RealtimeEnvelope;
  receivedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function friendlyError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Tente novamente em instantes.";
}

// ── WS Status Badge ───────────────────────────────────────────────────────────

const wsStatusConfig: Record<
  WsStatus,
  { dot: string; text: string; label: string }
> = {
  open: { dot: "bg-success", text: "text-success", label: "OPEN" },
  connecting: {
    dot: "bg-warning animate-pulse",
    text: "text-warning",
    label: "CONNECTING",
  },
  error: { dot: "bg-destructive", text: "text-destructive", label: "ERROR" },
  closed: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    label: "CLOSED",
  },
};

function WsStatusBadge({ status, label }: { status: WsStatus; label: string }) {
  const cfg = wsStatusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1">
      <span className={cn("size-2 rounded-full shrink-0", cfg.dot)} />
      <Text variant="xs" muted>
        {label}
      </Text>
      <Text variant="xs" className={cn("font-mono font-medium", cfg.text)}>
        {cfg.label}
      </Text>
    </span>
  );
}

// ── Context selector ──────────────────────────────────────────────────────────

interface ContextSelectorProps {
  restaurantId: string;
  locationId: string;
  onRestaurantChange: (id: string) => void;
  onLocationChange: (id: string) => void;
}

function ContextSelector({
  restaurantId,
  locationId,
  onRestaurantChange,
  onLocationChange,
}: ContextSelectorProps) {
  const { data: locations = [], isLoading: locationsLoading } =
    useLocations(restaurantId);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1.5 flex-1">
        <Text variant="xs" muted>
          Restaurante
        </Text>
        <RestaurantCombobox
          value={restaurantId}
          onChange={(id) => {
            onRestaurantChange(id);
            onLocationChange("");
          }}
          placeholder="Selecionar restaurante…"
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <Text variant="xs" muted>
          Filial
        </Text>
        <Select
          value={locationId}
          onValueChange={onLocationChange}
          disabled={!restaurantId || locationsLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                locationsLoading ? "Carregando…" : "Selecionar filial…"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Event log ─────────────────────────────────────────────────────────────────

const eventTypeVariant: Record<string, BadgeVariant> = {
  CONNECTION_READY: "secondary",
  USER_JOINED: "success",
  USER_LEFT: "warning",
  ORDER_CREATED: "info",
  ORDER_STATUS_CHANGED: "info",
  PAYMENT_COMPLETED: "success",
  SESSION_CLOSED: "destructive",
};

// Group events into labelled categories for display
const eventGroups: Array<{ label: string; emoji: string; types: string[] }> = [
  {
    label: "Sessão",
    emoji: "🟢",
    types: ["CONNECTION_READY", "SESSION_CLOSED"],
  },
  { label: "Usuários", emoji: "👤", types: ["USER_JOINED", "USER_LEFT"] },
  {
    label: "Pedidos",
    emoji: "🛒",
    types: ["ORDER_CREATED", "ORDER_STATUS_CHANGED"],
  },
  { label: "Pagamento", emoji: "💳", types: ["PAYMENT_COMPLETED"] },
];

function getGroup(type: string) {
  return (
    eventGroups.find((g) => g.types.includes(type)) ?? {
      label: "Outros",
      emoji: "⚡",
      types: [],
    }
  );
}

function EventLogEntry({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = React.useState(false);
  const variant = eventTypeVariant[entry.envelope.type] ?? "secondary";
  const payload = (entry.envelope as Record<string, unknown>).payload;

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Badge
          variant={entry.channel === "location" ? "info" : "success"}
          className="shrink-0 text-xs"
        >
          {entry.channel === "location" ? "filial" : "sessão"}
        </Badge>
        <Badge variant={variant} className="shrink-0 font-mono text-xs">
          {entry.envelope.type}
        </Badge>
        <Text variant="xs" muted className="ml-auto shrink-0 tabular-nums">
          {new Date(entry.receivedAt).toLocaleTimeString()}
        </Text>
        {expanded ? (
          <ChevronDown size={12} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-muted-foreground shrink-0" />
        )}
      </button>
      {expanded && (
        <pre className="mx-3 mb-2 rounded bg-muted px-3 py-2 text-xs overflow-x-auto text-foreground">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

function EventLogPanel({
  entries,
  onClear,
}: {
  entries: LogEntry[];
  onClear: () => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [entries.length]);

  // Build grouped structure
  const grouped = React.useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    for (const entry of entries) {
      const g = getGroup(entry.envelope.type);
      const key = g.label;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  }, [entries]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            📡 Log de Eventos
            {entries.length > 0 && (
              <Badge variant="secondary" className="tabular-nums">
                {entries.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={entries.length === 0}
          >
            <Trash2 size={14} className="mr-1.5" />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div ref={scrollRef} className="max-h-80 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex h-20 items-center justify-center">
              <Text variant="xs" muted>
                Aguardando eventos WS…
              </Text>
            </div>
          ) : (
            eventGroups
              .filter((g) => grouped.has(g.label))
              .map((g) => (
                <div key={g.label}>
                  <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-3 py-1 border-b border-border">
                    <Text
                      variant="xs"
                      className="font-semibold text-muted-foreground"
                    >
                      {g.emoji} {g.label}
                    </Text>
                  </div>
                  {grouped.get(g.label)!.map((entry) => (
                    <EventLogEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              ))
          )}
          {/* Ungrouped events */}
          {(() => {
            const knownTypes = eventGroups.flatMap((g) => g.types);
            const others = entries.filter(
              (e) => !knownTypes.includes(e.envelope.type),
            );
            if (others.length === 0) return null;
            return (
              <div>
                <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-3 py-1 border-b border-border">
                  <Text
                    variant="xs"
                    className="font-semibold text-muted-foreground"
                  >
                    ⚡ Outros
                  </Text>
                </div>
                {others.map((entry) => (
                  <EventLogEntry key={entry.id} entry={entry} />
                ))}
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Simulated clients panel ───────────────────────────────────────────────────

interface SimulatedClientsPanelProps {
  restaurantId: string;
  locationId: string;
  onEvent: (envelope: RealtimeEnvelope) => void;
}

function SimulatedClientsPanel({
  restaurantId,
  locationId,
  onEvent,
}: SimulatedClientsPanelProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = React.useState("");
  const [tableId, setTableId] = React.useState("");
  const [clients, setClients] = React.useState<SimulatedClient[]>([]);
  const [activeClientId, setActiveClientId] = React.useState<string | null>(
    null,
  );
  const guestJoin = useGuestJoinSession();

  const { data: tables = [] } = useTables(restaurantId, locationId || null);
  const selectedTable = tables.find((t) => t.id === tableId);
  const sessionId = selectedTable?.activeSessionId ?? null;

  // Active client resolved
  const activeClient =
    clients.find((c) => c.localId === activeClientId) ?? clients[0] ?? null;

  // Reset simulated clients when table changes
  React.useEffect(() => {
    setClients([]);
    setActiveClientId(null);
  }, [tableId]);

  function handleSimulate() {
    if (!sessionId || !displayName.trim()) return;
    const email = `test-${crypto.randomUUID().slice(0, 8)}@juntai.app`;
    guestJoin.mutate(
      { sessionId, email, displayName: displayName.trim() },
      {
        onSuccess: (result) => {
          const newClient: SimulatedClient = {
            localId: crypto.randomUUID(),
            token: result.token,
            userId: result.user.id,
            memberId: result.member.id,
            displayName: result.member.displayName,
            email,
            joinedAt: result.member.joinedAt,
          };
          setClients((prev) => [...prev, newClient]);
          setActiveClientId(newClient.localId);
          setDisplayName("");
          toast.success(`"${displayName.trim()}" entrou na mesa.`);
        },
        onError: (err) =>
          toast.error("Erro ao simular cliente.", {
            description: friendlyError(err),
          }),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* ── Left: simulation controls ─────────────────────────── */}
      <Card className="flex flex-col gap-0 lg:w-72 shrink-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Badge variant="success">Cliente</Badge>
            Clientes simulados
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-5 pt-5">
          {/* Table selector */}
          <div className="flex flex-col gap-1.5">
            <Text variant="xs" muted>
              Mesa para simulação
            </Text>
            <Select
              value={tableId}
              onValueChange={setTableId}
              disabled={tables.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar mesa…" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                    {t.area ? ` · ${t.area}` : ""}
                    {t.activeSessionId ? " ✓" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tableId && !sessionId && (
              <Text variant="xs" muted>
                Abra esta mesa na visão do staff acima.
              </Text>
            )}
          </div>

          {/* Simulate form */}
          <div className="flex flex-col gap-2">
            <Text variant="sm" className="font-medium">
              Simular entrada de cliente
            </Text>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do cliente…"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!sessionId}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSimulate();
                }}
              />
              <Button
                variant="default"
                size="sm"
                disabled={
                  !sessionId || !displayName.trim() || guestJoin.isPending
                }
                loading={guestJoin.isPending}
                onClick={handleSimulate}
                className="shrink-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Client selector list */}
          <div className="flex flex-col gap-1.5">
            <Text variant="xs" muted>
              Ativos ({clients.length})
            </Text>
            {clients.length === 0 ? (
              <Text variant="xs" muted className="italic">
                Nenhum cliente simulado ainda.
              </Text>
            ) : (
              <div className="flex flex-col gap-1">
                {clients.map((client) => {
                  const isActive = activeClient?.localId === client.localId;
                  return (
                    <div
                      key={client.localId}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
                        isActive
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/50 border border-transparent",
                      )}
                      onClick={() => setActiveClientId(client.localId)}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          isActive ? "bg-primary" : "bg-muted-foreground/40",
                        )}
                      />
                      <Text
                        variant="xs"
                        className={cn(
                          "flex-1 truncate",
                          isActive && "font-semibold",
                        )}
                      >
                        {client.displayName}
                      </Text>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClients((prev) =>
                            prev.filter((c) => c.localId !== client.localId),
                          );
                          if (activeClientId === client.localId) {
                            setActiveClientId(null);
                          }
                        }}
                        aria-label="Remover"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Right: phone preview ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <Text variant="xs" muted className="self-start">
          {activeClient
            ? `Visualizando como: ${activeClient.displayName}`
            : "Selecione um cliente para ver o preview"}
        </Text>
        {activeClient && sessionId ? (
          <GuestSessionView
            sessionId={sessionId}
            token={activeClient.token}
            displayName={activeClient.displayName}
            tableLabel={selectedTable?.label}
            onEvent={onEvent}
            interactive
          />
        ) : (
          <div className="w-[375px] h-[780px] rounded-xl border-4 border-dashed border-border flex items-center justify-center">
            <Text variant="xs" muted className="text-center px-8">
              Simule um cliente e selecione-o para ver o preview mobile.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root panel ────────────────────────────────────────────────────────────────

export function SessionTestPanel() {
  const [restaurantId, setRestaurantId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [eventLog, setEventLog] = React.useState<LogEntry[]>([]);

  const { sessionToken } = useAuth();

  const addToLog = React.useCallback(
    (channel: "session" | "location", envelope: RealtimeEnvelope) => {
      setEventLog((prev) =>
        [
          {
            id: crypto.randomUUID(),
            channel,
            envelope,
            receivedAt: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 300),
      );
    },
    [],
  );

  const addLocationEvent = React.useCallback(
    (envelope: RealtimeEnvelope) => addToLog("location", envelope),
    [addToLog],
  );

  const addSessionEvent = React.useCallback(
    (envelope: RealtimeEnvelope) => addToLog("session", envelope),
    [addToLog],
  );

  const { status: locationStatus } = useLocationChannel({
    locationId: locationId || null,
    restaurantId: restaurantId || null,
    token: sessionToken,
    onEvent: addLocationEvent,
  });

  const ready = !!restaurantId && !!locationId;

  return (
    <div className="flex flex-col gap-6">
      {/* Context selector */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <Text variant="sm" className="font-medium mb-3">
          Contexto
        </Text>
        <ContextSelector
          restaurantId={restaurantId}
          locationId={locationId}
          onRestaurantChange={setRestaurantId}
          onLocationChange={setLocationId}
        />
      </div>

      {/* WS filial badge */}
      {!!locationId && (
        <div className="flex items-center gap-3">
          <WsStatusBadge status={locationStatus} label="WS filial" />
        </div>
      )}

      {/* Staff view — real TablesView */}
      {ready && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="border-b border-border bg-surface px-4 py-2.5 flex items-center gap-2">
            <Badge variant="info">Staff</Badge>
            <Text variant="sm" className="font-medium">
              Visão do operador
            </Text>
          </div>
          <TablesView restaurantId={restaurantId} locationId={locationId} />
        </div>
      )}

      {/* Bottom panels */}
      {ready ? (
        <div className="flex flex-col gap-4">
          <SimulatedClientsPanel
            restaurantId={restaurantId}
            locationId={locationId}
            onEvent={addSessionEvent}
          />
          <EventLogPanel entries={eventLog} onClear={() => setEventLog([])} />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Text variant="sm" muted>
            Selecione um restaurante e filial para começar.
          </Text>
        </div>
      )}
    </div>
  );
}
