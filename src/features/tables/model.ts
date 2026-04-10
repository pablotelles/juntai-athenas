import type { Table } from "./types";

export type MesaStatus = "livre" | "ocupada" | "reservada" | "inativa";
export type MesaFilterValue = "todas" | MesaStatus;

export interface MesaReserva {
  nomeCliente: string;
  horario: string;
  telefone?: string;
}

export interface Mesa extends Table {
  nome: string;
  capacidade: number;
  status: MesaStatus;
  pessoasConectadas: number;
  reserva?: MesaReserva;
  ocupacaoInicio?: string | null;
  filialId: string;
  sessionId?: string | null;
}

export const MESA_STATUS_LABELS: Record<MesaFilterValue, string> = {
  todas: "Todas",
  livre: "Livre",
  ocupada: "Ocupada",
  reservada: "Reservada",
  inativa: "Inativa",
};

export const MESA_SERVICE_MODE_LABELS: Record<Mesa["serviceMode"], string> = {
  shared_tab: "Comanda compartilhada",
  individual_tabs: "Comandas individuais",
};

export function mapTableToMesa(table: Table): Mesa {
  const capacidade = table.capacity ?? 4;
  const sessionId = table.activeSessionId ?? null;
  const pessoasConectadas = table.connectedUsersCount ?? 0;

  const status: MesaStatus = !table.isActive
    ? "inativa"
    : sessionId
      ? "ocupada"
      : "livre";

  return {
    ...table,
    nome: table.label,
    capacidade,
    status,
    pessoasConectadas,
    reserva: undefined,
    ocupacaoInicio: table.occupiedAt ?? null,
    filialId: table.locationId,
    sessionId,
  };
}

export function getMesaStatusCounts(mesas: Mesa[]) {
  return {
    todas: mesas.length,
    livre: mesas.filter((mesa) => mesa.status === "livre").length,
    ocupada: mesas.filter((mesa) => mesa.status === "ocupada").length,
    reservada: mesas.filter((mesa) => mesa.status === "reservada").length,
    inativa: mesas.filter((mesa) => mesa.status === "inativa").length,
  } satisfies Record<MesaFilterValue, number>;
}
