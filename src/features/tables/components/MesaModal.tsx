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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/card/Card";
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
        <ModalContent className="max-w-6xl overflow-hidden p-0" showClose={false}>
          {mesa ? (
            <div className="flex max-h-[85vh] flex-col">
              <div className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
                <div className="px-6 py-5">
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

                {isOccupied ? (
                  <div className="border-t border-border/80 px-6 py-4">
                    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                      <Card className="bg-background/80 shadow-none">
                        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <CardTitle className="text-base">Comanda atual</CardTitle>
                            <CardDescription className="mt-1">
                              {sortedOrders.length} pedidos lançados nesta sessão.
                            </CardDescription>
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
                        </CardContent>
                      </Card>

                      <Card className="bg-background/80 shadow-none">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">Sessão ativa</CardTitle>
                              <CardDescription className="mt-1">
                                Acompanhe o ritmo do atendimento desta mesa.
                              </CardDescription>
                            </div>
                            <Badge variant="success">Em andamento</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-2">
                          <div className="rounded-lg bg-surface px-4 py-3">
                            <Text variant="xs" muted>
                              Duração
                            </Text>
                            <Text variant="body" className="mt-1 font-semibold">
                              {formatElapsed(mesa.ocupacaoInicio)}
                            </Text>
                          </div>
                          <div className="rounded-lg bg-surface px-4 py-3">
                            <Text variant="xs" muted>
                              Pessoas
                            </Text>
                            <Text variant="body" className="mt-1 font-semibold">
                              {activeMembers.length}
                            </Text>
                          </div>
                          <div className="rounded-lg bg-surface px-4 py-3">
                            <Text variant="xs" muted>
                              Itens lançados
                            </Text>
                            <Text variant="body" className="mt-1 font-semibold">
                              {totalOrderedItems}
                            </Text>
                          </div>
                          <div className="rounded-lg bg-surface px-4 py-3">
                            <Text variant="xs" muted>
                              Consumo
                            </Text>
                            <Text variant="body" className="mt-1 font-semibold">
                              {formatPrice(totalConsumption)}
                            </Text>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="overflow-y-auto px-6 py-6">
                {!isOccupied ? (
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-dashed bg-background/80 shadow-none">
                      <CardHeader>
                        <CardTitle>Mesa pronta para novo atendimento</CardTitle>
                        <CardDescription>
                          Compartilhe o acesso da mesa para iniciar uma nova sessão
                          ou ocupe a mesa pelo atalho do card no salão.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-border bg-surface px-4 py-3">
                          <Text variant="xs" muted>
                            Link da mesa
                          </Text>
                          <Text variant="sm" className="mt-1 break-all font-medium">
                            {accessLink}
                          </Text>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-background/80 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-base">Resumo rápido</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <div className="rounded-lg bg-surface px-4 py-3">
                          <Text variant="xs" muted>
                            Status
                          </Text>
                          <Text variant="body" className="mt-1 font-semibold capitalize">
                            {mesa.status}
                          </Text>
                        </div>
                        <div className="rounded-lg bg-surface px-4 py-3">
                          <Text variant="xs" muted>
                            Modo de serviço
                          </Text>
                          <Text variant="body" className="mt-1 font-semibold">
                            {mesa.serviceMode === "individual_tabs"
                              ? "Comandas individuais"
                              : "Comanda compartilhada"}
                          </Text>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    <section className="space-y-4">
                      {isOrdersLoading ? (
                        <Card className="bg-background/80 shadow-none">
                          <CardContent className="flex h-40 items-center justify-center p-6">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          </CardContent>
                        </Card>
                      ) : sortedOrders.length === 0 ? (
                        <Card className="border-dashed bg-background/80 shadow-none">
                          <CardContent className="flex flex-col items-start gap-4 p-6 text-left">
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
                          </CardContent>
                        </Card>
                      ) : (
                        sortedOrders.map((order) => {
                          const nextStatus = getNextStatus(order.status);
                          const isUpdating =
                            updateOrderStatus.isPending &&
                            updateOrderStatus.variables?.orderId === order.id;

                          return (
                            <Card key={order.id} className="bg-background/80 shadow-none">
                              <CardHeader className="pb-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <CardTitle className="text-base">
                                        Pedido #{order.id.slice(0, 8)}
                                      </CardTitle>
                                      <Badge variant={STATUS_VARIANTS[order.status]}>
                                        {STATUS_LABELS[order.status]}
                                      </Badge>
                                    </div>
                                    <CardDescription className="mt-1">
                                      {formatDateTime(order.createdAt)}
                                    </CardDescription>
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
                              </CardHeader>

                              <CardContent className="space-y-3">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-lg bg-surface px-4 py-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <Text variant="sm" className="font-medium">
                                          {item.quantity}x {item.snapshot.name}
                                        </Text>
                                        {item.notes ? (
                                          <Text variant="xs" muted className="mt-1">
                                            Obs.: {item.notes}
                                          </Text>
                                        ) : null}
                                      </div>
                                      <Text variant="sm" className="font-medium">
                                        {formatPrice(item.unitPrice * item.quantity)}
                                      </Text>
                                    </div>
                                  </div>
                                ))}

                                {nextStatus ? (
                                  <div className="flex justify-end pt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      loading={isUpdating}
                                      onClick={() => handleAdvanceStatus(order.id, order.status)}
                                    >
                                      Avançar para {STATUS_LABELS[nextStatus]}
                                    </Button>
                                  </div>
                                ) : null}
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </section>

                    <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
                      <Card className="bg-background/80 shadow-none">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">Membros da mesa</CardTitle>
                          </div>
                          <CardDescription>
                            Controle quem está participando da sessão e acesse o fluxo do cliente.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {isMembersLoading ? (
                            <div className="flex h-28 items-center justify-center rounded-lg bg-surface px-4 py-4">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                          ) : activeMembers.length === 0 ? (
                            <div className="rounded-lg bg-surface px-4 py-8 text-center">
                              <Text variant="sm" muted>
                                Nenhum participante ativo nesta sessão.
                              </Text>
                            </div>
                          ) : (
                            activeMembers.map((member) => {
                              const isRemoving =
                                removeSessionMember.isPending &&
                                removeSessionMember.variables?.memberId === member.id;

                              return (
                                <Card key={member.id} className="bg-surface shadow-none">
                                  <CardContent className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                                    <div className="min-w-0">
                                      <Text variant="body" className="font-semibold">
                                        {member.displayName}
                                      </Text>
                                      <div className="mt-2 flex items-start gap-2 text-muted-foreground">
                                        <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <Text variant="xs" muted>
                                          Entrou em {formatDateTime(member.joinedAt)}
                                        </Text>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
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
                                          handleRemoveMember(member.id, member.displayName)
                                        }
                                      >
                                        <UserRoundX className="h-4 w-4" />
                                        Remover
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>

                      <Card className="bg-background/80 shadow-none">
                        <CardHeader>
                          <CardTitle className="text-base">Encerramento</CardTitle>
                          <CardDescription>
                            Feche a conta quando todos os pedidos estiverem concluídos e a mesa
                            puder voltar para o salão.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            className="w-full"
                            variant="destructive"
                            onClick={() => onCloseBill(mesa)}
                          >
                            Fechar conta da mesa
                          </Button>
                        </CardContent>
                      </Card>
                    </aside>
                  </div>
                )}
              </div>
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
