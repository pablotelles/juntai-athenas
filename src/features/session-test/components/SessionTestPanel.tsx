"use client";

import * as React from "react";
import {
  Clock,
  Users,
  XCircle,
  ChevronDown,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import { RestaurantCombobox } from "@/components/shared/restaurant-combobox/RestaurantCombobox";
import { UserCombobox } from "@/components/shared/user-combobox/UserCombobox";
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
import { Avatar } from "@/components/shared/avatar/Avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog/ConfirmDialog";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useAuth } from "@/contexts/auth/AuthProvider";
import { useLocations } from "@/features/restaurants/hooks";
import {
  useTables,
  useConnectTable,
  useCloseTableSession,
  useAddSessionMember,
  useSessionMembers,
  useTableSession,
  useGuestJoinSession,
} from "@/features/tables/hooks";
import { useUsers } from "@/features/users/hooks";
import { useLocationChannel } from "@/hooks/useLocationChannel";
import { useWebSocket, type WsStatus } from "@/hooks/useWebSocket";
import { cn } from "@/lib/cn";
import type { TableSessionMember, RealtimeEnvelope } from "@juntai/types";

const BASE_WS_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/^http/, "ws");

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

function elapsed(isoDate: string) {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`;
}

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
  tableId: string;
  onRestaurantChange: (id: string) => void;
  onLocationChange: (id: string) => void;
  onTableChange: (id: string) => void;
}

function ContextSelector({
  restaurantId,
  locationId,
  tableId,
  onRestaurantChange,
  onLocationChange,
  onTableChange,
}: ContextSelectorProps) {
  const { data: locations = [], isLoading: locationsLoading } =
    useLocations(restaurantId);
  const { data: tables = [], isLoading: tablesLoading } = useTables(
    restaurantId,
    locationId || null,
  );

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
            onTableChange("");
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
          onValueChange={(id) => {
            onLocationChange(id);
            onTableChange("");
          }}
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

      <div className="flex flex-col gap-1.5 flex-1">
        <Text variant="xs" muted>
          Mesa
        </Text>
        <Select
          value={tableId}
          onValueChange={onTableChange}
          disabled={!locationId || tablesLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={tablesLoading ? "Carregando…" : "Selecionar mesa…"}
            />
          </SelectTrigger>
          <SelectContent>
            {tables.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
                {t.area ? ` · ${t.area}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Session status card ───────────────────────────────────────────────────────

function SessionStatusCard({ sessionId }: { sessionId: string | null }) {
  const { data: session, isLoading } = useTableSession(sessionId);
  const { data: members = [] } = useSessionMembers(sessionId);

  if (!sessionId) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <XCircle size={16} className="text-muted-foreground" />
        <Text variant="sm" muted>
          Sem sessão ativa nesta mesa
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-3">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
        <Text variant="sm" muted>
          Carregando sessão…
        </Text>
      </div>
    );
  }

  if (!session) return null;

  const isOpen = session.status === "OPEN";
  const activeCount = members.filter((m) => !m.leftAt).length;

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-3">
        <Badge variant={isOpen ? "success" : "secondary"} dot>
          {isOpen ? "Sessão aberta" : "Sessão encerrada"}
        </Badge>
        {isOpen && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={13} />
            <Text variant="xs" muted>
              {elapsed(session.openedAt)}
            </Text>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Users size={13} />
        <Text variant="xs" muted>
          {activeCount} {activeCount === 1 ? "pessoa" : "pessoas"}
        </Text>
      </div>
    </div>
  );
}

// ── Members list ──────────────────────────────────────────────────────────────

function MemberList({ members }: { members: TableSessionMember[] }) {
  if (members.length === 0) {
    return (
      <Text variant="xs" muted className="italic">
        Nenhum cliente na mesa ainda.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-2">
          <Avatar
            fallback={m.displayName.slice(0, 2).toUpperCase()}
            size="sm"
          />
          <div className="flex flex-col">
            <Text variant="sm">{m.displayName}</Text>
            <Text variant="xs" muted>
              {m.leftAt ? "Saiu" : `Entrou há ${elapsed(m.joinedAt)}`}
            </Text>
          </div>
          {m.leftAt && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Saiu
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Staff side ────────────────────────────────────────────────────────────────

interface StaffSideProps {
  restaurantId: string;
  locationId: string;
  tableId: string;
  sessionId: string | null;
  onSessionOpen: (sessionId: string) => void;
  onSessionClose: () => void;
}

function StaffSide({
  restaurantId,
  locationId,
  tableId,
  sessionId,
  onSessionOpen,
  onSessionClose,
}: StaffSideProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [confirmClose, setConfirmClose] = React.useState(false);

  const { data: tables = [] } = useTables(restaurantId, locationId || null);
  const selectedTable = tables.find((t) => t.id === tableId);

  const { data: members = [] } = useSessionMembers(sessionId);
  const { data: usersPage } = useUsers({ page: 1, limit: 100 });
  const selectedUser = usersPage?.data.find((u) => u.id === selectedUserId);

  const connectTable = useConnectTable();
  const closeSession = useCloseTableSession();
  const addMember = useAddSessionMember();

  function handleOpen() {
    if (!selectedTable) return;
    connectTable.mutate(
      { qrCodeToken: selectedTable.qrCodeToken },
      {
        onSuccess: ({ session }) => {
          onSessionOpen(session.id);
          toast.success("Mesa aberta com sucesso.");
        },
        onError: (err) =>
          toast.error("Erro ao abrir mesa.", {
            description: friendlyError(err),
          }),
      },
    );
  }

  function handleClose() {
    if (!sessionId) return;
    closeSession.mutate(
      { sessionId, restaurantId },
      {
        onSuccess: () => {
          onSessionClose();
          setConfirmClose(false);
          toast.success("Mesa encerrada.");
        },
        onError: (err) =>
          toast.error("Erro ao encerrar mesa.", {
            description: friendlyError(err),
          }),
      },
    );
  }

  function handleAddUser() {
    if (!sessionId || !selectedUser) return;
    addMember.mutate(
      {
        sessionId,
        userId: selectedUser.id,
        displayName: selectedUser.name ?? selectedUser.email ?? selectedUser.id,
      },
      {
        onSuccess: () => {
          setSelectedUserId("");
          toast.success(
            `${selectedUser.name ?? selectedUser.email} adicionado à mesa.`,
          );
        },
        onError: (err) =>
          toast.error("Erro ao adicionar cliente.", {
            description: friendlyError(err),
          }),
      },
    );
  }

  // Only exclude currently active members from the combobox
  const alreadyInSession = members
    .filter((m) => !m.leftAt)
    .map((m) => m.userId);

  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Badge variant="info">Staff</Badge>
          Visão do operador
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-5">
        {/* Session actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            disabled={!tableId || !!sessionId || connectTable.isPending}
            loading={connectTable.isPending}
            onClick={handleOpen}
          >
            Abrir mesa
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!sessionId || closeSession.isPending}
            onClick={() => setConfirmClose(true)}
          >
            Fechar mesa
          </Button>
        </div>

        {/* Add existing user */}
        <div className="flex flex-col gap-2">
          <Text variant="sm" className="font-medium">
            Adicionar cliente à mesa
          </Text>
          <UserCombobox
            value={selectedUserId}
            onChange={setSelectedUserId}
            excludeIds={alreadyInSession}
            placeholder="Pesquisar usuário…"
            disabled={!sessionId}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedUserId || !sessionId || addMember.isPending}
            loading={addMember.isPending}
            onClick={handleAddUser}
          >
            Adicionar
          </Button>
        </div>

        {/* Member list */}
        <div className="flex flex-col gap-2">
          <Text variant="sm" className="font-medium">
            Pessoas na mesa
          </Text>
          <MemberList members={members} />
        </div>
      </CardContent>

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Encerrar mesa?"
        description="Isso encerrará a sessão para todos os clientes conectados. Esta ação não pode ser desfeita."
        confirmLabel="Encerrar"
        destructive
        onConfirm={handleClose}
      />
    </Card>
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

  // Scroll to top (newest-first) on each new entry
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [entries.length]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Log de Eventos
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
        <div ref={scrollRef} className="h-115 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Text variant="xs" muted>
                Aguardando eventos WS…
              </Text>
            </div>
          ) : (
            entries.map((entry) => (
              <EventLogEntry key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Simulated client card ─────────────────────────────────────────────────────

interface SimulatedClientCardProps {
  client: SimulatedClient;
  sessionId: string;
  onEvent: (envelope: RealtimeEnvelope) => void;
  onRemove: () => void;
}

function SimulatedClientCard({
  client,
  sessionId,
  onEvent,
  onRemove,
}: SimulatedClientCardProps) {
  const wsUrl = `${BASE_WS_URL}/ws/session/${sessionId}?token=${client.token}`;
  const { status } = useWebSocket<RealtimeEnvelope>({
    url: wsUrl,
    onMessage: onEvent,
  });

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            fallback={client.displayName.slice(0, 2).toUpperCase()}
            size="sm"
          />
          <div className="min-w-0">
            <Text variant="sm" className="font-medium truncate">
              {client.displayName}
            </Text>
            <Text variant="xs" muted className="truncate">
              {client.email}
            </Text>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          aria-label="Remover cliente simulado"
        >
          <XCircle size={15} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <WsStatusBadge status={status} label="WS sessão" />
        <Text variant="xs" muted>
          há {elapsed(client.joinedAt)}
        </Text>
      </div>
    </div>
  );
}

// ── Simulated clients panel ───────────────────────────────────────────────────

interface SimulatedClientsPanelProps {
  sessionId: string | null;
  onEvent: (envelope: RealtimeEnvelope) => void;
}

function SimulatedClientsPanel({
  sessionId,
  onEvent,
}: SimulatedClientsPanelProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = React.useState("");
  const [clients, setClients] = React.useState<SimulatedClient[]>([]);
  const guestJoin = useGuestJoinSession();

  // Reset simulated clients when session changes
  React.useEffect(() => {
    setClients([]);
  }, [sessionId]);

  function handleSimulate() {
    if (!sessionId || !displayName.trim()) return;
    const email = `test-${crypto.randomUUID().slice(0, 8)}@juntai.app`;
    guestJoin.mutate(
      { sessionId, email, displayName: displayName.trim() },
      {
        onSuccess: (result) => {
          setClients((prev) => [
            ...prev,
            {
              localId: crypto.randomUUID(),
              token: result.token,
              userId: result.user.id,
              memberId: result.member.id,
              displayName: result.member.displayName,
              email,
              joinedAt: result.member.joinedAt,
            },
          ]);
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
    <Card className="flex flex-col gap-0">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Badge variant="success">Cliente</Badge>
          Clientes simulados
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-5">
        {/* Simulate form */}
        <div className="flex flex-col gap-2">
          <Text variant="sm" className="font-medium">
            Simular entrada de cliente
          </Text>
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
            disabled={!sessionId || !displayName.trim() || guestJoin.isPending}
            loading={guestJoin.isPending}
            onClick={handleSimulate}
          >
            Simular cliente
          </Button>
          {!sessionId && (
            <Text variant="xs" muted>
              Abra a mesa primeiro (lado esquerdo).
            </Text>
          )}
        </div>

        {/* Client cards */}
        <div className="flex flex-col gap-2">
          <Text variant="sm" className="font-medium">
            Ativos ({clients.length})
          </Text>
          {clients.length === 0 ? (
            <Text variant="xs" muted className="italic">
              Nenhum cliente simulado ainda.
            </Text>
          ) : (
            <div className="flex flex-col gap-2">
              {clients.map((client) => (
                <SimulatedClientCard
                  key={client.localId}
                  client={client}
                  sessionId={sessionId!}
                  onEvent={onEvent}
                  onRemove={() =>
                    setClients((prev) =>
                      prev.filter((c) => c.localId !== client.localId),
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Root panel ────────────────────────────────────────────────────────────────

export function SessionTestPanel() {
  const [restaurantId, setRestaurantId] = React.useState("");
  const [locationId, setLocationId] = React.useState("");
  const [tableId, setTableId] = React.useState("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
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

  const { data: tables = [] } = useTables(restaurantId, locationId || null);
  const selectedTable = tables.find((t) => t.id === tableId);

  // Sync active session from table data
  React.useEffect(() => {
    if (!selectedTable) {
      setSessionId(null);
      return;
    }
    setSessionId(selectedTable.activeSessionId ?? null);
  }, [selectedTable]);

  const ready = !!restaurantId && !!locationId && !!tableId;

  return (
    <div className="flex flex-col gap-6">
      {/* Context selector */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <Text variant="sm" className="font-medium mb-3">
          Selecionar mesa
        </Text>
        <ContextSelector
          restaurantId={restaurantId}
          locationId={locationId}
          tableId={tableId}
          onRestaurantChange={setRestaurantId}
          onLocationChange={setLocationId}
          onTableChange={setTableId}
        />
      </div>

      {/* Status bar */}
      {ready && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <WsStatusBadge status={locationStatus} label="WS filial" />
          </div>
          <SessionStatusCard sessionId={sessionId} />
        </div>
      )}

      {/* Main panels */}
      {ready ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <StaffSide
            restaurantId={restaurantId}
            locationId={locationId}
            tableId={tableId}
            sessionId={sessionId}
            onSessionOpen={setSessionId}
            onSessionClose={() => setSessionId(null)}
          />
          <SimulatedClientsPanel
            sessionId={sessionId}
            onEvent={addSessionEvent}
          />
          <EventLogPanel entries={eventLog} onClear={() => setEventLog([])} />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Text variant="sm" muted>
            Selecione um restaurante, filial e mesa para começar.
          </Text>
        </div>
      )}
    </div>
  );
}
