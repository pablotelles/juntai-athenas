"use client";

import { Clock3, Eye, Plus, QrCode, UserRoundX, Users } from "lucide-react";
import { Badge } from "@/components/primitives/badge/Badge";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/card/Card";
import { cn } from "@/lib/cn";
import type {
  MesaMemberConsumptionSummary,
  MesaUnassignedOrdersSummary,
} from "@/features/tables/member-attribution";

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
  removingMemberId?: string | null;
  onViewAsClient: () => void;
  onCopyAccess: () => void;
  onAddPerson: () => void;
  onRemoveMember: (memberId: string, displayName: string) => void;
}

const ORDER_STATUS_LABELS = {
  PENDING: "Pendente",
  PREPARING: "Preparando",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
} as const;

function getOrderStatusLabel(status: keyof typeof ORDER_STATUS_LABELS) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function MesaMembersTab({
  memberSummaries,
  capacity,
  totalConsumption,
  unassigned,
  isLoading = false,
  removingMemberId,
  onViewAsClient,
  onCopyAccess,
  onAddPerson,
  onRemoveMember,
}: MesaMembersTabProps) {
  const linkedOrders = memberSummaries.reduce(
    (sum, summary) => sum + summary.orders.length,
    0,
  );
  const linkedItems = memberSummaries.reduce(
    (sum, summary) => sum + summary.totalItems,
    0,
  );

  return (
    <section className="space-y-4">
      <Card className="bg-background/80 shadow-none">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Membros ({memberSummaries.length}/{capacity})
              </CardTitle>
            </div>
            <CardDescription>
              Acompanhe quem entrou na sessão e o consumo já vinculado por
              pessoa.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onViewAsClient}>
              <Eye className="mr-2 h-4 w-4" />
              Ver como cliente
            </Button>
            <Button variant="outline" size="sm" onClick={onCopyAccess}>
              <QrCode className="mr-2 h-4 w-4" />
              QR do cliente
            </Button>
            <Button size="sm" onClick={onAddPerson}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar pessoa
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
            <Text variant="xs" muted>
              Lugares ocupados
            </Text>
            <Text className="mt-1 text-lg font-semibold tabular-nums">
              {memberSummaries.length}/{capacity}
            </Text>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
            <Text variant="xs" muted>
              Pedidos vinculados
            </Text>
            <Text className="mt-1 text-lg font-semibold tabular-nums">
              {linkedOrders}
            </Text>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
            <Text variant="xs" muted>
              Itens atribuídos
            </Text>
            <Text className="mt-1 text-lg font-semibold tabular-nums">
              {linkedItems}
            </Text>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
            <Text variant="xs" muted>
              Consumo total da mesa
            </Text>
            <Text className="mt-1 text-lg font-semibold tabular-nums">
              {formatPrice(totalConsumption)}
            </Text>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-dashed bg-background/70 shadow-none">
          <CardContent className="py-8">
            <Text muted>Carregando participantes da sessão...</Text>
          </CardContent>
        </Card>
      ) : memberSummaries.length === 0 ? (
        <Card className="border-dashed bg-background/70 shadow-none">
          <CardContent className="py-8">
            <Text muted>Nenhum participante ativo na sessão.</Text>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {memberSummaries.map((summary) => {
            const {
              member,
              items,
              orders,
              totalConsumption: memberTotal,
            } = summary;
            const isRemoving = removingMemberId === member.id;

            return (
              <Card key={member.id} className="bg-background/80 shadow-none">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {member.displayName}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          Entrou: {formatDateTime(member.joinedAt)}
                        </span>
                        <span>{orders.length} pedido(s)</span>
                        <span>{summary.totalItems} item(ns)</span>
                      </CardDescription>
                    </div>

                    <div className="text-right">
                      <Text variant="xs" muted>
                        Consumo
                      </Text>
                      <Text className="text-base font-semibold tabular-nums">
                        {formatPrice(memberTotal)}
                      </Text>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5">
                      <Text muted>
                        Sem pedidos atribuídos para este participante.
                      </Text>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={`${item.orderId}:${item.id}`}
                          className="rounded-2xl border border-border/70 bg-muted/20 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Text className="font-medium">{item.name}</Text>
                                <Badge
                                  variant="outline"
                                  className="text-[11px]"
                                >
                                  {getOrderStatusLabel(item.orderStatus)}
                                </Badge>
                              </div>
                              <Text variant="xs" muted>
                                Pedido em {formatDateTime(item.orderCreatedAt)}
                              </Text>
                              {item.notes ? (
                                <Text
                                  variant="xs"
                                  className="text-muted-foreground"
                                >
                                  Obs.: {item.notes}
                                </Text>
                              ) : null}
                            </div>

                            <div className="text-right">
                              <Text variant="xs" muted>
                                {item.quantity} x {formatPrice(item.unitPrice)}
                              </Text>
                              <Text className="font-medium tabular-nums">
                                {formatPrice(item.totalPrice)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("gap-2", isRemoving && "opacity-80")}
                      disabled={isRemoving || !!removingMemberId}
                      onClick={() =>
                        onRemoveMember(member.id, member.displayName)
                      }
                    >
                      <UserRoundX className="h-4 w-4" />
                      {isRemoving ? "Removendo..." : "Remover da mesa"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {unassigned.orders.length > 0 ? (
        <Card className="border-dashed bg-background/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Pedidos sem vínculo</CardTitle>
            <CardDescription>
              Itens lançados na sessão sem associação direta a um participante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                <Text variant="xs" muted>
                  Pedidos sem vínculo
                </Text>
                <Text className="mt-1 text-lg font-semibold tabular-nums">
                  {unassigned.orders.length}
                </Text>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                <Text variant="xs" muted>
                  Itens sem vínculo
                </Text>
                <Text className="mt-1 text-lg font-semibold tabular-nums">
                  {unassigned.totalItems}
                </Text>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                <Text variant="xs" muted>
                  Valor pendente de associação
                </Text>
                <Text className="mt-1 text-lg font-semibold tabular-nums">
                  {formatPrice(unassigned.totalConsumption)}
                </Text>
              </div>
            </div>

            <div className="space-y-3">
              {unassigned.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-border/70 bg-muted/20 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Text className="font-medium">
                          Pedido #{order.id.slice(-6)}
                        </Text>
                        <Badge variant="outline" className="text-[11px]">
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <Text variant="xs" muted>
                        Criado em {formatDateTime(order.createdAt)}
                      </Text>
                    </div>

                    <Text className="font-medium tabular-nums">
                      {formatPrice(
                        order.items.reduce(
                          (sum, item) => sum + item.unitPrice * item.quantity,
                          0,
                        ),
                      )}
                    </Text>
                  </div>

                  <div className="mt-3 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-border/50 bg-background/70 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <Text className="font-medium">
                            {item.snapshot.name}
                          </Text>
                          {item.notes ? (
                            <Text
                              variant="xs"
                              className="text-muted-foreground"
                            >
                              Obs.: {item.notes}
                            </Text>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <Text variant="xs" muted>
                            {item.quantity} x {formatPrice(item.unitPrice)}
                          </Text>
                          <Text className="font-medium tabular-nums">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
