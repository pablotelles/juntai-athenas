import { XCircle } from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { Input } from "@/components/primitives/input/Input";
import { Text } from "@/components/primitives/text/Text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/select/Select";
import { cn } from "@/lib/cn";
import type { SimulatedClient } from "./types";

interface SessionTestTableOption {
  id: string;
  label: string;
  area?: string | null;
  activeSessionId?: string | null;
}

export interface SimulatedClientControlsProps {
  tableId: string;
  sessionId: string | null;
  tables: SessionTestTableOption[];
  displayName: string;
  isPending: boolean;
  clients: SimulatedClient[];
  activeClientId: string | null;
  onTableChange: (tableId: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSimulate: () => void;
  onSelectClient: (clientId: string) => void;
  onRemoveClient: (clientId: string) => void;
}

export function SimulatedClientControls({
  tableId,
  sessionId,
  tables,
  displayName,
  isPending,
  clients,
  activeClientId,
  onTableChange,
  onDisplayNameChange,
  onSimulate,
  onSelectClient,
  onRemoveClient,
}: SimulatedClientControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Text variant="xs" muted>
          Mesa para simulação
        </Text>
        <Select
          value={tableId}
          onValueChange={onTableChange}
          disabled={tables.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar mesa…" />
          </SelectTrigger>
          <SelectContent>
            {tables.map((table) => (
              <SelectItem key={table.id} value={table.id}>
                {table.label}
                {table.area ? ` · ${table.area}` : ""}
                {table.activeSessionId ? " ✓" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tableId && !sessionId ? (
          <Text variant="xs" muted>
            Abra esta mesa na visão do staff ao lado.
          </Text>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Text variant="sm" className="font-medium">
            Novo cliente
          </Text>
          <Text variant="xs" muted>
            {clients.length} ativo(s)
          </Text>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Nome do cliente…"
            value={displayName}
            onChange={(event) => onDisplayNameChange(event.target.value)}
            disabled={!sessionId}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSimulate();
            }}
          />
          <Button
            variant="default"
            size="sm"
            disabled={!sessionId || !displayName.trim() || isPending}
            loading={isPending}
            onClick={onSimulate}
            className="shrink-0"
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Text variant="xs" muted>
          Ativos
        </Text>

        {clients.length === 0 ? (
          <Text variant="xs" muted className="italic">
            Nenhum cliente simulado ainda.
          </Text>
        ) : (
          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto pr-1">
            {clients.map((client) => {
              const isActive = activeClientId === client.localId;

              return (
                <div
                  key={client.localId}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary/10"
                      : "border-transparent hover:bg-muted/50",
                  )}
                  onClick={() => onSelectClient(client.localId)}
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      isActive ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                  />
                  <Text
                    variant="xs"
                    className={cn("flex-1 truncate", isActive && "font-semibold")}
                  >
                    {client.displayName}
                  </Text>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveClient(client.localId);
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
    </div>
  );
}