"use client";

import * as React from "react";
import { Armchair, CalendarClock, Clock3, MoveLeft, Users } from "lucide-react";
import { Avatar } from "@/components/shared/avatar/Avatar";
import { Text } from "@/components/primitives/text/Text";
import { cn } from "@/lib/cn";
import { MESA_SERVICE_MODE_LABELS, type Mesa } from "../model";
import { MesaQuickActions } from "./MesaQuickActions";
import { MesaStatusBadge } from "./MesaStatusBadge";

export interface MesaCardProps {
  mesa: Mesa;
  onToggleOccupancy: (mesa: Mesa) => void;
  onOpenQr: (mesa: Mesa) => void;
  onConnect: (mesa: Mesa) => void;
  onEdit: (mesa: Mesa) => void;
  onViewOrder: (mesa: Mesa) => void;
  onMore: (mesa: Mesa) => void;
}

function formatClock(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatElapsed(value?: string | null) {
  if (!value) return "Agora";
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );

  if (diffMinutes < 60) return `${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

function formatServiceMode(mesa: Mesa) {
  return MESA_SERVICE_MODE_LABELS[mesa.serviceMode] ?? "Comanda compartilhada";
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-3">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <Text variant="xs" className="uppercase tracking-wide">
          {label}
        </Text>
      </div>
      <Text variant="body" className="font-semibold text-foreground">
        {value}
      </Text>
    </div>
  );
}

export function MesaCard({
  mesa,
  onToggleOccupancy,
  onOpenQr,
  onConnect,
  onEdit,
  onViewOrder,
  onMore,
}: MesaCardProps) {
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [trayOpen, setTrayOpen] = React.useState(false);

  const reserveTime = mesa.reserva ? formatClock(mesa.reserva.horario) : null;
  const occupancyLabel =
    mesa.status === "ocupada"
      ? `Há ${formatElapsed(mesa.ocupacaoInicio)}`
      : mesa.status === "reservada" && reserveTime
        ? `Às ${reserveTime}`
        : mesa.status === "inativa"
          ? "Fora de operação"
          : "Disponível agora";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center gap-2 bg-secondary/80 px-3 md:hidden",
          "transition-transform duration-200",
          trayOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <MesaQuickActions
          mesa={mesa}
          compact
          onToggleOccupancy={onToggleOccupancy}
          onOpenQr={onOpenQr}
          onConnect={onConnect}
          onEdit={onEdit}
          onViewOrder={onViewOrder}
          onMore={onMore}
        />
      </div>

      <div
        className={cn(
          "relative rounded-3xl bg-surface p-4 transition-transform duration-200 sm:p-5",
          trayOpen ? "-translate-x-28" : "translate-x-0",
        )}
        onTouchStart={(event) =>
          setTouchStartX(event.changedTouches[0]?.clientX ?? null)
        }
        onTouchEnd={(event) => {
          const endX = event.changedTouches[0]?.clientX ?? null;
          if (touchStartX === null || endX === null) return;
          const delta = endX - touchStartX;
          if (delta < -40) setTrayOpen(true);
          if (delta > 40) setTrayOpen(false);
          setTouchStartX(null);
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <Text variant="h4" className="text-base sm:text-lg">
              {mesa.nome}
            </Text>
            <Text variant="sm" muted className="mt-1">
              {mesa.area ? `${mesa.area} · ` : ""}
              {formatServiceMode(mesa)} ·{" "}
              {mesa.status === "reservada"
                ? "Mesa preparada para chegada iminente."
                : mesa.status === "ocupada"
                  ? "Mesa em atendimento ativo."
                  : mesa.status === "inativa"
                    ? "Oculta para novos atendimentos."
                    : "Pronta para receber clientes."}
            </Text>
          </div>
          <MesaStatusBadge status={mesa.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <InfoTile
            icon={<Armchair className="h-4 w-4" />}
            label="Capacidade"
            value={`${mesa.capacidade} lugares`}
          />
          <InfoTile
            icon={<Users className="h-4 w-4" />}
            label="Conectados"
            value={`${mesa.pessoasConectadas} pessoa${mesa.pessoasConectadas === 1 ? "" : "s"}`}
          />
          <InfoTile
            icon={<Clock3 className="h-4 w-4" />}
            label={mesa.status === "ocupada" ? "Ocupação" : "Próximo horário"}
            value={occupancyLabel}
          />
          <InfoTile
            icon={<CalendarClock className="h-4 w-4" />}
            label="Operação"
            value={
              mesa.area
                ? `${mesa.area} · ${formatServiceMode(mesa)}`
                : formatServiceMode(mesa)
            }
          />
        </div>

        {mesa.reserva ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-info/20 bg-info/5 p-3">
            <Avatar fallback={mesa.reserva.nomeCliente.slice(0, 2)} size="sm" />
            <div className="min-w-0">
              <Text variant="sm" className="font-medium">
                Reserva · {mesa.reserva.nomeCliente}
              </Text>
              <Text variant="sm" muted className="truncate">
                {reserveTime ? `Chegada às ${reserveTime}` : "Chegada agendada"}
                {mesa.reserva.telefone ? ` · ${mesa.reserva.telefone}` : ""}
              </Text>
            </div>
          </div>
        ) : null}

        <div className="mt-4 hidden md:block">
          <MesaQuickActions
            mesa={mesa}
            onToggleOccupancy={onToggleOccupancy}
            onOpenQr={onOpenQr}
            onConnect={onConnect}
            onEdit={onEdit}
            onViewOrder={onViewOrder}
            onMore={onMore}
          />
        </div>

        <div className="mt-3 flex items-center justify-between md:hidden">
          <Text variant="sm" muted className="flex items-center gap-1">
            <MoveLeft className="h-3.5 w-3.5" />
            Arraste para ações rápidas
          </Text>
          <button
            type="button"
            onClick={() => setTrayOpen((current) => !current)}
            className="text-xs font-medium text-primary"
          >
            {trayOpen ? "Fechar" : "Ações"}
          </button>
        </div>
      </div>
    </div>
  );
}
