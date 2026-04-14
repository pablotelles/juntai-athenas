"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  Clock3,
  Eye,
  Plus,
  QrCode,
  ReceiptText,
  UserRoundX,
  Users,
} from "lucide-react";
import { Badge } from "@/components/primitives/badge/Badge";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/shared/modal/Modal";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useUpdateOrderStatus } from "@/features/orders/hooks";
import type { OrderStatus } from "@/features/orders/types";
import {
  useRemoveSessionMember,
  useSessionMembers,
  useStaffSessionOrders,
} from "@/features/tables/hooks";
import { cn } from "@/lib/cn";
import type { Mesa } from "../model";
import { StaffAddItemSheet } from "./StaffAddItemSheet";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PREPARING: "Preparando",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANTS: Record<
  OrderStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  PENDING: "warning",
  PREPARING: "info",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

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

function getNextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "PENDING") return "PREPARING";
  if (status === "PREPARING") return "DELIVERED";
  return null;
}

function getOrderTotal(order: {
  items: Array<{ quantity: number; unitPrice: number }>;
}) {
  return order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
}

export interface MesaModalProps {
  mesa: Mesa | null;
  restaurantId: string;
  onClose: () => void;
  onCloseBill: (mesa: Mesa) => void;
  onTransfer?: (mesa: Mesa) => void;
}

export function MesaModal({
  mesa,
  restaurantId,
  onClose,
  onCloseBill,
  onTransfer,
}: MesaModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddItemOpen, setAddItemOpen] = React.useState(false);

  const sessionId = mesa?.sessionId ?? null;
  const isOccupied = mesa?.status === "ocupada" && !!sessionId;

  const { data: orders = [], isLoading: isOrdersLoading } =
    useStaffSessionOrders(sessionId);
  const { data: members = [], isLoading: isMembersLoading } =
    useSessionMembers(sessionId);

  const updateOrderStatus = useUpdateOrderStatus(restaurantId);
  const removeSessionMember = useRemoveSessionMember();

  const activeMembers = React.useMemo(
    () => members.filter((member) => !member.leftAt),
    [members],
  );

  const sortedOrders = React.useMemo(
    () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders],
  );

  const totalConsumption = React.useMemo(
    () => sortedOrders.reduce((sum, order) => sum + getOrderTotal(order), 0),
    [sortedOrders],
  );

  const totalOrderedItems = React.useMemo(
    () =>
      sortedOrders.reduce(
        (sum, order) =>
          sum + order.items.reduce((itemsSum, item) => itemsSum + item.quantity, 0),
        0,
      ),
    [sortedOrders],
  );

  const accessLink = React.useMemo(() => {
    if (!mesa) return "";
    if (typeof window === "undefined") return `/mesa/${mesa.qrCodeToken}`;
    return `${window.location.origin}/mesa/${mesa.qrCodeToken}`;
  }, [mesa]);

  const handleAdvanceStatus = React.useCallback(
    (orderId: string, currentStatus: OrderStatus) => {
      const nextStatus = getNextStatus(currentStatus);
      if (!nextStatus || !sessionId) return;

      updateOrderStatus.mutate(
        { orderId, status: nextStatus },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey: ["session-orders", sessionId],
            });
            toast.success(
              `Pedido atualizado para ${STATUS_LABELS[nextStatus]}.`,
            );
          },
          onError: (error) => {
            toast.error("Não foi possível atualizar o pedido.", {
              description:
                error instanceof Error ? error.message : "Tente novamente.",
            });
          },
        },
      );
    },
    [queryClient, sessionId, toast, updateOrderStatus],
  );

  const handleRemoveMember = React.useCallback(
    (memberId: string, displayName: string) => {
      if (!sessionId) return;

      removeSessionMember.mutate(
        { sessionId, memberId },
        {
          onSuccess: () => {
            toast.success(`${displayName} removido da mesa.`);
          },
          onError: (error) => {
            toast.error("Não foi possível remover o participante.", {
              description:
                error instanceof Error ? error.message : "Tente novamente.",
            });
          },
        },
      );
    },
    [removeSessionMember, sessionId, toast],
  );

  const handleCopyAccess = React.useCallback(async () => {
    if (!accessLink) return;

    try {
      await navigator.clipboard.writeText(accessLink);
      toast.success("Link de acesso copiado.");
    } catch {
      toast.error("Não foi possível copiar o link da mesa.");
    }
  }, [accessLink, toast]);

  const handleViewAsClient = React.useCallback(() => {
    if (!accessLink || typeof window === "undefined") return;
    window.open(accessLink, "_blank", "noopener,noreferrer");
  }, [accessLink]);

  const handlePartialClose = React.useCallback(() => {
    toast.info("Fechamento parcial em preparação.", {
      description: "O resumo da mesa já está pronto; falta ligar o fluxo financeiro.",
    });
  }, [toast]);

  React.useEffect(() => {
    if (!mesa) {
      setAddItemOpen(false);
    }
  }, [mesa]);

  return (
    <>
      <Modal open={!!mesa} onOpenChange={(open) => !open && onClose()}>
        <ModalContent className="max-w-6xl p-0" showClose={false}>
          {mesa ? (
            <div className="max-h-[85vh] overflow-y-auto">
              <div className="border-b border-border bg-surface/95 px-6 py-5">
                <ModalHeader className="mb-0 gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ModalTitle>Comanda da {mesa.nome}</ModalTitle>
                        <Badge variant={isOccupied ? "warning" : "secondary"}>
                          {isOccupied ? "Sessão ativa" : "Mesa sem sessão"}
                        </Badge>
                      </div>
                      <ModalDescription>
                        {mesa.area ? `${mesa.area} · ` : ""}
                        capacidade para {mesa.capacidade} lugares.
                      </ModalDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOccupied ? (
                        <Button onClick={() => setAddItemOpen(true)}>
                          <Plus className="h-4 w-4" />
                          Adicionar item
                        </Button>
                      ) : null}
                      <Button variant="outline" onClick={handleCopyAccess}>
                        <QrCode className="h-4 w-4" />
                        Copiar acesso
                      </Button>
                      <Button variant="ghost" onClick={onClose}>
                        Fechar
                      </Button>
                    </div>
                  </div>
                </ModalHeader>
              </div>

              {!isOccupied ? (
                <div className="grid gap-4 p-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-md border border-dashed border-border bg-background/80 p-6">
                    <Text variant="h4">Mesa pronta para novo atendimento</Text>
                    <Text variant="sm" muted className="mt-2">
                      Compartilhe o acesso da mesa para iniciar uma nova sessão
                      ou ocupe a mesa pelo atalho do card no salão.
                    </Text>
                    <div className="mt-5 rounded-2xl border border-border bg-surface px-4 py-3">
                        <div className="rounded-md border border-border bg-background/80 px-5 py-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <Text variant="body" className="font-semibold">
                                Comanda atual
                              </Text>
                              <Text variant="sm" muted>
                                {sortedOrders.length} pedidos lançados nesta sessão.
                              </Text>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Button onClick={() => setAddItemOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Adicionar item
                              </Button>
                              <Button variant="outline" onClick={() => setAddItemOpen(true)}>
                                <QrCode className="h-4 w-4" />
                                Buscar rápido
                              </Button>
                              <Button variant="outline" onClick={handlePartialClose}>
                                <ReceiptText className="h-4 w-4" />
                                Fechar parcial
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => (mesa && onTransfer ? onTransfer(mesa) : null)}
                                disabled={!onTransfer}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                                Transferir mesa
                              </Button>
                            </div>
                          </div>
                        </div>

                        {isOrdersLoading ? (
                          <div className="flex h-40 items-center justify-center rounded-md border border-border bg-background/70">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          </div>
                        ) : sortedOrders.length === 0 ? (
                          <div className="rounded-md border border-dashed border-border bg-background/70 px-6 py-8">
                            <div className="flex flex-col items-start gap-4 text-left">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                                <ReceiptText className="h-5 w-5" />
                              </div>
                              <div>
                                <Text variant="h4">Nenhum pedido ainda</Text>
                                <Text variant="sm" muted className="mt-2 max-w-xl">
                                  Comece adicionando um item à comanda. O fluxo ideal aqui é buscar,
                                  tocar no item e continuar lançando sem sair da tela.
                                </Text>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button onClick={() => setAddItemOpen(true)}>
                                  <Plus className="h-4 w-4" />
                                  Adicionar primeiro item
                                </Button>
                                <Button variant="outline" onClick={() => setAddItemOpen(true)}>
                                  <QrCode className="h-4 w-4" />
                                  Buscar rápido
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          sortedOrders.map((order) => {
                            const nextStatus = getNextStatus(order.status);
                            const isUpdating =
                              updateOrderStatus.isPending &&
                              updateOrderStatus.variables?.orderId === order.id;

                            return (
                              <article
                                key={order.id}
                                className="rounded-md border border-border bg-background/80 p-5"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Text
                                        variant="body"
                                        className="font-semibold"
                                      >
                                        Pedido #{order.id.slice(0, 8)}
                                      </Text>
                                      <Badge
                                        variant={STATUS_VARIANTS[order.status]}
                                      >
                                        {STATUS_LABELS[order.status]}
                                      </Badge>
                                    </div>
                                    <Text variant="xs" muted className="mt-1">
                                      {formatDateTime(order.createdAt)}
                                    </Text>
                                  </div>

                                  <div className="text-right">
                                    <Text variant="xs" muted>
                                      Total
                                    </Text>
                                    <Text variant="body" className="font-semibold">
                                      {formatPrice(getOrderTotal(order))}
                                    </Text>
                                  </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="rounded-2xl bg-surface px-4 py-3"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <Text
                                            variant="sm"
                                            className="font-medium"
                                          >
                                            {item.quantity}x {item.snapshot.name}
                                          </Text>
                                          {item.notes && (
                                            <Text
                                              variant="xs"
                                              muted
                                              className="mt-1"
                                            >
                                              Obs.: {item.notes}
                                            </Text>
                                          )}
                                        </div>
                                        <Text variant="sm" className="font-medium">
                                          {formatPrice(
                                            item.unitPrice * item.quantity,
                                          )}
                                        </Text>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {nextStatus ? (
                                  <div className="mt-4 flex justify-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      loading={isUpdating}
                                      onClick={() =>
                                        handleAdvanceStatus(order.id, order.status)
                                      }
                                    >
                                      Avançar para {STATUS_LABELS[nextStatus]}
                                    </Button>
                                  </div>
                                ) : null}
                              </article>
                            );
                          })
                        )}
                                        {item.quantity}x {item.snapshot.name}
                                      </Text>
                                      {item.notes && (
                        <div className="rounded-md border border-border bg-background/80 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <Text variant="body" className="font-semibold">
                                Sessão ativa
                              </Text>
                              <Text variant="sm" muted>
                                Acompanhe o ritmo do atendimento desta mesa.
                              </Text>
                            </div>
                            <Badge variant="success">Em andamento</Badge>
                          </div>

                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                              <Text variant="sm" muted>
                                Duração
                              </Text>
                              <Text variant="sm" className="font-semibold">
                                {formatElapsed(mesa.ocupacaoInicio)}
                              </Text>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                              <Text variant="sm" muted>
                                Pessoas
                              </Text>
                              <Text variant="sm" className="font-semibold">
                                {activeMembers.length}
                              </Text>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                              <Text variant="sm" muted>
                                Itens lançados
                              </Text>
                              <Text variant="sm" className="font-semibold">
                                {totalOrderedItems}
                              </Text>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
                              <Text variant="sm" muted>
                                Consumo
                              </Text>
                              <Text variant="sm" className="font-semibold">
                                {formatPrice(totalConsumption)}
                              </Text>
                            </div>
                          </div>
                                  onClick={() =>
                                    handleAdvanceStatus(order.id, order.status)
                                  }
                                >
                                  Avançar para {STATUS_LABELS[nextStatus]}
                                </Button>
                              </div>
                            ) : null}
                          </article>
                        );
                      })
                    )}
                  </section>

                  <aside className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      <div className="rounded-md border border-border bg-background/80 px-4 py-4">
                        <Text variant="xs" muted>
                          Participantes ativos
                        </Text>
                        <Text variant="h4" className="mt-2">
                          {activeMembers.length}
                        </Text>
                      </div>
                      <div className="rounded-md border border-border bg-background/80 px-4 py-4">
                        <Text variant="xs" muted>
                          Pedidos lançados
                        </Text>
                        <Text variant="h4" className="mt-2">
                          {sortedOrders.length}
                        </Text>
                      </div>
                      <div className="rounded-md border border-border bg-background/80 px-4 py-4">
                        <Text variant="xs" muted>
                          Consumo total
                        </Text>
                        <Text variant="h4" className="mt-2">
                          {formatPrice(totalConsumption)}
                        </Text>
                      </div>
                    </div>

                    <div className="rounded-md border border-border bg-background/80 p-5">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <Text variant="body" className="font-semibold">
                          Membros da mesa
                        </Text>
                      </div>

                      {isMembersLoading ? (
                        <div className="flex h-28 items-center justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                      ) : activeMembers.length === 0 ? (
                        <div className="py-8 text-center">
                          <Text variant="sm" muted>
                            Nenhum participante ativo nesta sessão.
                          </Text>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {activeMembers.map((member) => {
                            const isRemoving =
                              removeSessionMember.isPending &&
                              removeSessionMember.variables?.memberId ===
                                member.id;

                            return (
                              <div
                                key={member.id}
                                className="rounded-2xl bg-surface px-4 py-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <Text variant="sm" className="font-medium">
                                      {member.displayName}
                                    </Text>
                                    <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                                      <Clock3 className="h-3.5 w-3.5" />
                                      <Text variant="xs" muted>
                                        Entrou em{" "}
                                        {formatDateTime(member.joinedAt)}
                                      </Text>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleViewAsClient}
                                    >
                                      <Eye className="h-4 w-4" />
                                      Ver como cliente
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCopyAccess}
                                    >
                                      <QrCode className="h-4 w-4" />
                                      QR
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      loading={isRemoving}
                                      className={cn(
                                        "text-destructive hover:bg-destructive/10 hover:text-destructive",
                                      )}
                                      onClick={() =>
                                        handleRemoveMember(
                                          member.id,
                                          member.displayName,
                                        )
                                      }
                                    >
                                      <UserRoundX className="h-4 w-4" />
                                      Remover
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border border-border bg-background/80 p-5">
                      <Text variant="body" className="font-semibold">
                        Encerramento
                      </Text>
                      <Text variant="sm" muted className="mt-2">
                        Feche a conta quando todos os pedidos estiverem
                        concluídos e a mesa puder voltar para o salão.
                      </Text>
                      <Button
                        className="mt-4 w-full"
                        variant="destructive"
                        onClick={() => onCloseBill(mesa)}
                      >
                        Fechar conta da mesa
                      </Button>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          ) : null}
        </ModalContent>
      </Modal>

      {mesa?.sessionId ? (
        <StaffAddItemSheet
          open={isAddItemOpen}
          onClose={() => setAddItemOpen(false)}
          sessionId={mesa.sessionId}
          restaurantId={restaurantId}
        />
      ) : null}
    </>
  );
}
