"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
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
import { Badge, type BadgeVariant } from "@/components/primitives/badge/Badge";
import { Text } from "@/components/primitives/text/Text";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useLocations } from "@/features/restaurants/hooks";
import { useLocationChannel } from "@/hooks/useLocationChannel";
import { type WsStatus } from "@/hooks/useWebSocket";
import { cn } from "@/lib/cn";
import type { RealtimeEnvelope } from "@juntai/types";
import { TablesView } from "@/features/tables/components/TablesView";
import { SimulatedClientsPanel } from "./SimulatedClientsPanel";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LogEntry {
  id: string;
  channel: "session" | "location";
  envelope: RealtimeEnvelope;
  receivedAt: string;
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
  trailingContent?: React.ReactNode;
  onRestaurantChange: (id: string) => void;
  onLocationChange: (id: string) => void;
}

function ContextSelector({
  restaurantId,
  locationId,
  trailingContent,
  onRestaurantChange,
  onLocationChange,
}: ContextSelectorProps) {
  const { data: locations = [], isLoading: locationsLoading } =
    useLocations(restaurantId);

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
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

      {trailingContent ? (
        <div className="flex items-end lg:justify-end">{trailingContent}</div>
      ) : null}
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
    <div className="-m-6 relative flex flex-col">
      <Card className="supports-backdrop-filter:bg-surface/95 absolute inset-x-0 top-0 z-20 rounded-none border-x-0 border-t-0 bg-surface shadow-none backdrop-blur">
        <CardContent className="px-6 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-5">
            <Text
              variant="xs"
              className="shrink-0 font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              Contexto
            </Text>
            <div className="min-w-0 flex-1">
              <ContextSelector
                restaurantId={restaurantId}
                locationId={locationId}
                trailingContent={
                  locationId ? (
                    <WsStatusBadge status={locationStatus} label="WS filial" />
                  ) : null
                }
                onRestaurantChange={setRestaurantId}
                onLocationChange={setLocationId}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 px-6 pb-6 pt-28">
        {ready ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] xl:items-start">
            <div className="flex flex-col gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-border bg-surface px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="info">Staff</Badge>
                    <Text variant="sm" className="font-medium">
                      Visão do operador
                    </Text>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <TablesView
                    restaurantId={restaurantId}
                    locationId={locationId}
                    showToolbar={false}
                  />
                </CardContent>
              </Card>

              <EventLogPanel
                entries={eventLog}
                onClear={() => setEventLog([])}
              />
            </div>

            <div className="flex flex-col gap-4 xl:sticky xl:top-4">
              <SimulatedClientsPanel
                restaurantId={restaurantId}
                locationId={locationId}
                onEvent={addSessionEvent}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Text variant="sm" muted>
              Selecione um restaurante e filial para começar.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
