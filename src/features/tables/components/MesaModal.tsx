"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  Plus,
  QrCode,
  ReceiptText,
} from "lucide-react";
import { Badge } from "@/components/primitives/badge/Badge";
import { Button } from "@/components/primitives/button/Button";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
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
  useCloseTableSession,
  useRemoveSessionMember,
  useSessionMembers,
  useStaffSessionOrders,
} from "@/features/tables/hooks";
import type { Mesa } from "../model";
import { MesaClosingTab } from "./MesaClosingTab";
import { MesaMembersTab } from "./MesaMembersTab";
import { MesaOrdersTab } from "./MesaOrdersTab";
import { StaffAddItemSheet } from "./StaffAddItemSheet";

type MesaActiveTab = "orders" | "members" | "closing";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PREPARING: "Preparando",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
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
  const [activeTab, setActiveTab] = React.useState<MesaActiveTab>("orders");

  const sessionId = mesa?.sessionId ?? null;
  const isOccupied = mesa?.status === "ocupada" && !!sessionId;

  const { data: orders = [], isLoading: isOrdersLoading } =
    useStaffSessionOrders(sessionId);
  const { data: members = [], isLoading: isMembersLoading } =
    useSessionMembers(sessionId);

  const updateOrderStatus = useUpdateOrderStatus(restaurantId);
  const closeTableSession = useCloseTableSession();
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

  const accessLink = React.useMemo(() => {
    if (!mesa) return "";
    if (typeof window === "undefined") return `/mesa/${mesa.qrCodeToken}`;
    return `${window.location.origin}/mesa/${mesa.qrCodeToken}`;
  }, [mesa]);

  const handleUpdateOrderStatus = React.useCallback(
    (orderId: string, nextStatus: OrderStatus | null) => {
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

  const handleAddPerson = React.useCallback(async () => {
    if (!accessLink) return;

    try {
      await navigator.clipboard.writeText(accessLink);
      toast.success("Link copiado para adicionar pessoa.", {
        description:
          "Compartilhe o acesso da mesa para o cliente entrar na sessão.",
      });
    } catch {
      toast.error("Não foi possível copiar o link para adicionar pessoa.");
    }
  }, [accessLink, toast]);

  const handlePartialClose = React.useCallback(() => {
    toast.info("Fechamento parcial em preparação.", {
      description:
        "O resumo da mesa já está pronto; falta ligar o fluxo financeiro.",
    });
  }, [toast]);

  const handleSplitDetails = React.useCallback(() => {
    toast.info("Divisão da conta em preparação.", {
      description:
        "Vamos conectar os modos de divisão por pessoa e por itens no fluxo financeiro.",
    });
  }, [toast]);

  const handleCancelSession = React.useCallback(() => {
    if (!mesa?.sessionId) return;
    if (typeof window !== "undefined") {
      const shouldCancel = window.confirm(
        `Cancelar a sessão ativa da ${mesa.nome}? Esta ação encerra a comanda atual.`,
      );

      if (!shouldCancel) return;
    }

    closeTableSession.mutate(
      { sessionId: mesa.sessionId, restaurantId },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["tables", restaurantId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["session-orders", mesa.sessionId],
            }),
            queryClient.invalidateQueries({
              queryKey: ["session-members", mesa.sessionId],
            }),
          ]);
          toast.success("Sessão cancelada.");
          onClose();
        },
        onError: (error) => {
          toast.error("Não foi possível cancelar a sessão.", {
            description:
              error instanceof Error ? error.message : "Tente novamente.",
          });
        },
      },
    );
  }, [closeTableSession, mesa, onClose, queryClient, restaurantId, toast]);

  React.useEffect(() => {
    if (!mesa) {
      setAddItemOpen(false);
    }
  }, [mesa]);

  React.useEffect(() => {
    setActiveTab("orders");
  }, [mesa?.id]);

  return (
    <>
      <Modal open={!!mesa} onOpenChange={(open) => !open && onClose()}>
        <ModalContent
          className="max-w-6xl overflow-hidden p-0"
          showClose={false}
        >
          {mesa ? (
            <div className="flex max-h-[85vh] flex-col">
              <div className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
                <div className="px-6 py-5">
                  <ModalHeader className="mb-0 gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ModalTitle>{mesa.nome}</ModalTitle>
                          {isOccupied ? (
                            <Badge variant="secondary">Comanda</Badge>
                          ) : null}
                          <Badge variant={isOccupied ? "warning" : "secondary"}>
                            {isOccupied ? "Sessão ativa" : "Mesa sem sessão"}
                          </Badge>
                        </div>
                        {mesa.area ? (
                          <ModalDescription>{mesa.area}</ModalDescription>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleCopyAccess}>
                          <QrCode className="h-4 w-4" />
                          Copiar acesso
                        </Button>
                        {isOccupied ? (
                          <Button
                            onClick={() => setAddItemOpen(true)}
                            className="shadow-lg"
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar item
                          </Button>
                        ) : null}
                        <Button variant="ghost" onClick={onClose}>
                          Fechar
                        </Button>
                      </div>
                    </div>
                  </ModalHeader>
                </div>

                {isOccupied ? (
                  <div className="border-t border-border/80 px-6 py-4">
                    <div className="space-y-4">
                      <Card className="bg-background/80 shadow-none">
                        <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                          <div className="flex items-center gap-2">
                            <Text variant="body" className="font-semibold">
                              {mesa.nome}
                            </Text>
                            <Badge variant="secondary">
                              <ReceiptText className="h-3.5 w-3.5" />
                              {sortedOrders.length} pedido
                              {sortedOrders.length === 1 ? "" : "s"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>{mesa.capacidade} lugares</span>
                            <span>{formatElapsed(mesa.ocupacaoInicio)}</span>
                            <span>
                              {activeMembers.length} pessoa
                              {activeMembers.length === 1 ? "" : "s"}
                            </span>
                            <span className="font-medium text-foreground">
                              {formatPrice(totalConsumption)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex flex-wrap gap-2">
                        <FilterChip
                          active={activeTab === "orders"}
                          count={sortedOrders.length}
                          onClick={() => setActiveTab("orders")}
                        >
                          Pedidos
                        </FilterChip>
                        <FilterChip
                          active={activeTab === "members"}
                          count={activeMembers.length}
                          onClick={() => setActiveTab("members")}
                        >
                          Membros
                        </FilterChip>
                        <FilterChip
                          active={activeTab === "closing"}
                          onClick={() => setActiveTab("closing")}
                        >
                          Fechamento
                        </FilterChip>
                      </div>
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
                          Compartilhe o acesso da mesa para iniciar uma nova
                          sessão ou ocupe a mesa pelo atalho do card no salão.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-border bg-surface px-4 py-3">
                          <Text variant="xs" muted>
                            Link da mesa
                          </Text>
                          <Text
                            variant="sm"
                            className="mt-1 break-all font-medium"
                          >
                            {accessLink}
                          </Text>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-background/80 shadow-none">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Resumo rápido
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <div className="rounded-lg bg-surface px-4 py-3">
                          <Text variant="xs" muted>
                            Status
                          </Text>
                          <Text
                            variant="body"
                            className="mt-1 font-semibold capitalize"
                          >
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
                  <div className="space-y-6">
                    {activeTab === "orders" ? (
                      <MesaOrdersTab
                        orders={sortedOrders}
                        isLoading={isOrdersLoading}
                        updatingOrderId={
                          updateOrderStatus.isPending
                            ? updateOrderStatus.variables?.orderId ?? null
                            : null
                        }
                        onUpdateOrderStatus={handleUpdateOrderStatus}
                        onAddItem={() => setAddItemOpen(true)}
                      />
                    ) : null}

                    {activeTab === "members" ? (
                      <MesaMembersTab
                        members={activeMembers}
                        capacity={mesa.capacidade}
                        totalConsumption={totalConsumption}
                        isLoading={isMembersLoading}
                        removingMemberId={
                          removeSessionMember.isPending
                            ? removeSessionMember.variables?.memberId ?? null
                            : null
                        }
                        onViewAsClient={handleViewAsClient}
                        onCopyAccess={handleCopyAccess}
                        onAddPerson={handleAddPerson}
                        onRemoveMember={handleRemoveMember}
                      />
                    ) : null}

                    {activeTab === "closing" ? (
                      <MesaClosingTab
                        mesaNome={mesa.nome}
                        activeMembersCount={activeMembers.length}
                        totalConsumption={totalConsumption}
                        isCancelling={closeTableSession.isPending}
                        onSplitDetails={handleSplitDetails}
                        onConfirmCloseBill={() => onCloseBill(mesa)}
                        onCancelSession={handleCancelSession}
                      />
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2 border-t border-border px-1 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddItemOpen(true)}
                      >
                        <QrCode className="h-4 w-4" />
                        Buscar rápido
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePartialClose}
                      >
                        <ReceiptText className="h-4 w-4" />
                        Fechar parcial
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          mesa && onTransfer ? onTransfer(mesa) : null
                        }
                        disabled={!onTransfer}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                        Transferir mesa
                      </Button>
                    </div>
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
