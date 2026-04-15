"use client";

import * as React from "react";
import { Eye, Plus, QrCode, UserRoundX } from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
import { Text } from "@/components/primitives/text/Text";
import type { OrderStatus } from "@/features/orders/types";
import type {
  MesaMemberConsumptionSummary,
  MesaUnassignedOrdersSummary,
} from "@/features/tables/member-attribution";
import { MesaOrdersTable } from "./MesaOrdersTable";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export interface MesaMembersTabProps {
  memberSummaries: MesaMemberConsumptionSummary[];
  capacity: number;
  totalConsumption: number;
  unassigned: MesaUnassignedOrdersSummary;
  isLoading?: boolean;
  updatingOrderId?: string | null;
  removingMemberId?: string | null;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onViewAsClient: () => void;
  onCopyAccess: () => void;
  onAddPerson: () => void;
  onRemoveMember: (memberId: string, displayName: string) => void;
}

const UNASSIGNED_TAB = "__unassigned__";

export function MesaMembersTab({
  memberSummaries,
  unassigned,
  isLoading = false,
  updatingOrderId,
  removingMemberId,
  onUpdateOrderStatus,
  onViewAsClient,
  onCopyAccess,
  onAddPerson,
  onRemoveMember,
}: MesaMembersTabProps) {
  const hasUnassigned = unassigned.orders.length > 0;

  const defaultTab =
    memberSummaries.length > 0
      ? memberSummaries[0].member.id
      : hasUnassigned
        ? UNASSIGNED_TAB
        : null;

  const [selectedTab, setSelectedTab] = React.useState<string | null>(
    defaultTab,
  );

  // Reset selected tab when member list changes (e.g., after removal)
  React.useEffect(() => {
    setSelectedTab((prev) => {
      const stillExists =
        prev === UNASSIGNED_TAB
          ? hasUnassigned
          : memberSummaries.some((s) => s.member.id === prev);
      if (stillExists) return prev;
      if (memberSummaries.length > 0) return memberSummaries[0].member.id;
      if (hasUnassigned) return UNASSIGNED_TAB;
      return null;
    });
  }, [memberSummaries, hasUnassigned]);

  const selectedSummary =
    selectedTab && selectedTab !== UNASSIGNED_TAB
      ? (memberSummaries.find((s) => s.member.id === selectedTab) ?? null)
      : null;

  const isUnassignedTab = selectedTab === UNASSIGNED_TAB;

  return (
    <section className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onViewAsClient}>
          <Eye className="h-4 w-4" />
          Ver como cliente
        </Button>
        <Button variant="outline" size="sm" onClick={onCopyAccess}>
          <QrCode className="h-4 w-4" />
          QR do cliente
        </Button>
        <Button size="sm" onClick={onAddPerson}>
          <Plus className="h-4 w-4" />
          Adicionar pessoa
        </Button>
      </div>

      {isLoading ? (
        <Text muted>Carregando participantes da sessão...</Text>
      ) : memberSummaries.length === 0 && !hasUnassigned ? (
        <Text muted>Nenhum participante ativo na sessão.</Text>
      ) : (
        <>
          {/* Member tabs */}
          <div className="flex flex-wrap gap-2">
            {memberSummaries.map((summary) => {
              const { member } = summary;
              const label = member.leftAt
                ? `${member.displayName} (saiu)`
                : member.displayName;
              return (
                <FilterChip
                  key={member.id}
                  active={selectedTab === member.id}
                  count={summary.orders.length}
                  onClick={() => setSelectedTab(member.id)}
                >
                  {label}
                </FilterChip>
              );
            })}
            {hasUnassigned && (
              <FilterChip
                active={selectedTab === UNASSIGNED_TAB}
                count={unassigned.orders.length}
                onClick={() => setSelectedTab(UNASSIGNED_TAB)}
              >
                Sem vínculo
              </FilterChip>
            )}
          </div>

          {/* Tab content */}
          {selectedSummary ? (
            <div className="space-y-4">
              {/* Member meta */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Text variant="sm" muted>
                    Entrou: {formatDateTime(selectedSummary.member.joinedAt)}
                    {selectedSummary.member.leftAt
                      ? ` · Saiu: ${formatDateTime(selectedSummary.member.leftAt)}`
                      : ""}
                  </Text>
                  <Text variant="sm" className="font-semibold tabular-nums">
                    {formatPrice(selectedSummary.totalConsumption)}
                  </Text>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    !!removingMemberId ||
                    removingMemberId === selectedSummary.member.id
                  }
                  onClick={() =>
                    onRemoveMember(
                      selectedSummary.member.id,
                      selectedSummary.member.displayName,
                    )
                  }
                >
                  <UserRoundX className="h-4 w-4" />
                  {removingMemberId === selectedSummary.member.id
                    ? "Removendo..."
                    : "Remover da mesa"}
                </Button>
              </div>

              <MesaOrdersTable
                orders={selectedSummary.orders}
                isLoading={false}
                updatingOrderId={updatingOrderId}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onAddFirstItem={onAddPerson}
              />
            </div>
          ) : isUnassignedTab ? (
            <div className="space-y-4">
              <Text variant="sm" muted>
                Pedidos lançados na sessão sem associação a um participante.
              </Text>
              <MesaOrdersTable
                orders={unassigned.orders}
                isLoading={false}
                updatingOrderId={updatingOrderId}
                onUpdateOrderStatus={onUpdateOrderStatus}
                onAddFirstItem={onAddPerson}
              />
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
