import {
  MoreHorizontal,
  Pencil,
  PlugZap,
  QrCode,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { IconButton } from "@/components/primitives/icon-button/IconButton";
import type { Mesa } from "../model";

export interface MesaQuickActionsProps {
  mesa: Mesa;
  compact?: boolean;
  onToggleOccupancy: (mesa: Mesa) => void;
  onOpenQr: (mesa: Mesa) => void;
  onConnect: (mesa: Mesa) => void;
  onEdit: (mesa: Mesa) => void;
  onViewOrder: (mesa: Mesa) => void;
  onMore: (mesa: Mesa) => void;
}

export function MesaQuickActions({
  mesa,
  compact = false,
  onToggleOccupancy,
  onOpenQr,
  onConnect,
  onEdit,
  onViewOrder,
  onMore,
}: MesaQuickActionsProps) {
  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <Button size="sm" onClick={() => onToggleOccupancy(mesa)}>
          {mesa.status === "ocupada" ? "Liberar" : "Ocupar"}
        </Button>
        <div className="flex items-center gap-2">
          <IconButton
            label={`Editar ${mesa.nome}`}
            icon={<Pencil className="h-4 w-4" />}
            variant="secondary"
            onClick={() => onEdit(mesa)}
          />
          <IconButton
            label={`Gerar QR da ${mesa.nome}`}
            icon={<QrCode className="h-4 w-4" />}
            variant="secondary"
            onClick={() => onOpenQr(mesa)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleOccupancy(mesa)}
      >
        {mesa.status === "ocupada" ? "Liberar" : "Ocupar"}
      </Button>
      <IconButton
        label={`Ver QR da ${mesa.nome}`}
        icon={<QrCode className="h-4 w-4" />}
        variant="outline"
        onClick={() => onOpenQr(mesa)}
      />
      <IconButton
        label={`Conectar usuário à ${mesa.nome}`}
        icon={<PlugZap className="h-4 w-4" />}
        variant="outline"
        onClick={() => onConnect(mesa)}
      />
      <IconButton
        label={`Editar ${mesa.nome}`}
        icon={<Pencil className="h-4 w-4" />}
        variant="outline"
        onClick={() => onEdit(mesa)}
      />
      <IconButton
        label={`Ver comanda da ${mesa.nome}`}
        icon={<ReceiptText className="h-4 w-4" />}
        variant="outline"
        onClick={() => onViewOrder(mesa)}
      />
      <IconButton
        label={`Mais ações da ${mesa.nome}`}
        icon={<MoreHorizontal className="h-4 w-4" />}
        variant="ghost"
        onClick={() => onMore(mesa)}
      />
    </div>
  );
}
