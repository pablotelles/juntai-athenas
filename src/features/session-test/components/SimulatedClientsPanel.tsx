"use client";

import * as React from "react";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useGuestJoinSession, useTables } from "@/features/tables/hooks";
import type { RealtimeEnvelope } from "@juntai/types";
import { SimulatedClientsModal } from "./SimulatedClientsModal";
import { SimulatedClientPreview } from "./SimulatedClientPreview";
import type { SimulatedClient } from "./types";

function friendlyError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Tente novamente em instantes.";
}

export interface SimulatedClientsPanelProps {
  restaurantId: string;
  locationId: string;
  onEvent: (envelope: RealtimeEnvelope) => void;
}

export function SimulatedClientsPanel({
  restaurantId,
  locationId,
  onEvent,
}: SimulatedClientsPanelProps) {
  const { toast } = useToast();
  const [isManagerOpen, setManagerOpen] = React.useState(false);
  const [displayName, setDisplayName] = React.useState("");
  const [tableId, setTableId] = React.useState("");
  const [clients, setClients] = React.useState<SimulatedClient[]>([]);
  const [activeClientId, setActiveClientId] = React.useState<string | null>(
    null,
  );
  const guestJoin = useGuestJoinSession();

  const { data: tables = [] } = useTables(restaurantId, locationId || null);
  const selectedTable = tables.find((table) => table.id === tableId);
  const sessionId = selectedTable?.activeSessionId ?? null;
  const activeClient =
    clients.find((client) => client.localId === activeClientId) ??
    clients[0] ??
    null;

  React.useEffect(() => {
    setClients([]);
    setActiveClientId(null);
  }, [tableId]);

  function handleSimulate() {
    const nextDisplayName = displayName.trim();
    if (!sessionId || !nextDisplayName) return;

    const email = `test-${crypto.randomUUID().slice(0, 8)}@juntai.app`;

    guestJoin.mutate(
      { sessionId, email, displayName: nextDisplayName },
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

          setClients((previous) => [...previous, newClient]);
          setActiveClientId(newClient.localId);
          setDisplayName("");
          toast.success(`"${nextDisplayName}" entrou na mesa.`);
        },
        onError: (error) => {
          toast.error("Erro ao simular cliente.", {
            description: friendlyError(error),
          });
        },
      },
    );
  }

  function handleRemoveClient(clientId: string) {
    setClients((previous) => {
      const nextClients = previous.filter((client) => client.localId !== clientId);

      if (activeClientId === clientId) {
        setActiveClientId(nextClients[0]?.localId ?? null);
      }

      return nextClients;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <SimulatedClientPreview
        activeClient={activeClient}
        sessionId={sessionId}
        tableLabel={selectedTable?.label}
        onEvent={onEvent}
        onOpenManager={() => setManagerOpen(true)}
      />

      <SimulatedClientsModal
        open={isManagerOpen}
        tableId={tableId}
        sessionId={sessionId}
        tables={tables}
        displayName={displayName}
        isPending={guestJoin.isPending}
        clients={clients}
        activeClientId={activeClient?.localId ?? null}
        onOpenChange={setManagerOpen}
        onTableChange={setTableId}
        onDisplayNameChange={setDisplayName}
        onSimulate={handleSimulate}
        onSelectClient={setActiveClientId}
        onRemoveClient={handleRemoveClient}
      />
    </div>
  );
}