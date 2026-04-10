import { Badge, type BadgeVariant } from "@/components/primitives/badge/Badge";
import { cn } from "@/lib/cn";
import { MESA_STATUS_LABELS, type MesaStatus } from "../model";

const STATUS_VARIANTS: Record<MesaStatus, BadgeVariant> = {
  livre: "success",
  ocupada: "warning",
  reservada: "info",
  inativa: "secondary",
};

export interface MesaStatusBadgeProps {
  status: MesaStatus;
  className?: string;
}

export function MesaStatusBadge({ status, className }: MesaStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} dot className={cn("capitalize", className)}>
      {MESA_STATUS_LABELS[status]}
    </Badge>
  );
}
