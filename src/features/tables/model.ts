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

const RESERVATION_NAMES = [
  "Marina Costa",
  "Rafael Souza",
  "Juliana Lima",
  "Grupo Aniversário",
];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function mapTableToMesa(table: Table, index: number): Mesa {
  const hash = hashString(`${table.id}:${table.label}:${table.locationId}`);
  const capacidade = table.capacity ?? [2, 4, 4, 6, 8][hash % 5];

  let status: MesaStatus = table.isActive ? "livre" : "inativa";
  let pessoasConectadas = 0;
  let reserva: MesaReserva | undefined;
  let ocupacaoInicio: string | null = null;

  if (!table.isActive) {
    status = "inativa";
  } else if (hash % 11 === 0) {
    status = "inativa";
  } else if (hash % 7 === 0) {
    status = "reservada";
    const horario = new Date(Date.now() + (index + 1) * 20 * 60 * 1000).toISOString();
    reserva = {
      nomeCliente: RESERVATION_NAMES[hash % RESERVATION_NAMES.length] ?? "Cliente",
      horario,
      telefone: `(11) 9${String(1000 + (hash % 9000)).padStart(4, "0")}-${String(1000 + ((hash >> 3) % 9000)).padStart(4, "0")}`,
    };
  } else if (hash % 3 === 0) {
    status = "ocupada";
    pessoasConectadas = Math.max(1, Math.min(capacidade, (hash % capacidade) + 1));
    ocupacaoInicio = new Date(
      Date.now() - ((hash % 180) + 15) * 60 * 1000,
    ).toISOString();
  }

  return {
    ...table,
    nome: table.label,
    capacidade,
    status,
    pessoasConectadas,
    reserva,
    ocupacaoInicio,
    filialId: table.locationId,
    sessionId: null,
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
