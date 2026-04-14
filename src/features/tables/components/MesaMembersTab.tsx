"use client";

import { Clock3, Eye, Plus, QrCode, UserRoundX, Users } from "lucide-react";
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
import type { TableSessionMember } from "@/features/tables/api";

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
  members: TableSessionMember[];
  capacity: number;
  totalConsumption: number;
  isLoading?: boolean;
  removingMemberId?: string | null;
  onViewAsClient: () => void;
  onCopyAccess: () => void;
  onAddPerson: () => void;
  onRemoveMember: (memberId: string, displayName: string) => void;
}

export function MesaMembersTab({
  members,
  capacity,
  totalConsumption,
  isLoading = false,
  removingMemberId,
  onViewAsClient,
  onCopyAccess,
  onAddPerson,
  onRemoveMember,
}: MesaMembersTabProps) {
  return (
    <section className="space-y-4">
      <Card className="bg-background/80 shadow-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">
              Membros ({members.length}/{capacity})
            </CardTitle>
          </div>
          <CardDescription>
            Controle quem está na mesa e prepare a divisão por pessoa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex h-28 items-center justify-center rounded-lg bg-surface px-4 py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-lg bg-surface px-4 py-8 text-center">
              <Text variant="sm" muted>
                Nenhum participante ativo nesta sessão.
              </Text>
            </div>
          ) : (
            members.map((member) => {
              const isRemoving = removingMemberId === member.id;

              return (
                <Card key={member.id} className="bg-surface shadow-none">
                  <CardContent className="space-y-4 p-4">
                    <div className="min-w-0">
                      <Text variant="body" className="font-semibold">
                        {member.displayName}
                      </Text>
                      <div className="mt-2 flex items-start gap-2 text-muted-foreground">
                        <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <Text variant="xs" muted>
                          Entrou: {formatDateTime(member.joinedAt)}
                        </Text>
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed border-border bg-background px-4 py-3">
                      <Text variant="xs" muted>
                        Consumo individual
                      </Text>
                      <Text variant="sm" className="mt-1 font-medium">
                        Em integração com a atribuição por membro e pagamentos da sessão.
                      </Text>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={onViewAsClient}>
                        <Eye className="h-4 w-4" />
                        Ver pedidos individuais
                      </Button>
                      <Button variant="outline" size="sm" onClick={onCopyAccess}>
                        <QrCode className="h-4 w-4" />
                        QR do cliente
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={isRemoving}
                        className={cn(
                          "text-destructive hover:bg-destructive/10 hover:text-destructive",
                        )}
                        onClick={() => onRemoveMember(member.id, member.displayName)}
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

          <Button variant="outline" className="w-full" onClick={onAddPerson}>
            <Plus className="h-4 w-4" />
            Adicionar pessoa
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-background/80 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Resumo da mesa</CardTitle>
          <CardDescription>
            Panorama do que falta consolidar por pessoa.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-surface px-4 py-3">
            <Text variant="xs" muted>
              Total de membros
            </Text>
            <Text variant="body" className="mt-1 font-semibold">
              {members.length}
            </Text>
          </div>
          <div className="rounded-lg bg-surface px-4 py-3">
            <Text variant="xs" muted>
              Já pagaram
            </Text>
            <Text variant="body" className="mt-1 font-semibold">
              Em integração
            </Text>
          </div>
          <div className="rounded-lg bg-surface px-4 py-3">
            <Text variant="xs" muted>
              Valor pendente
            </Text>
            <Text variant="body" className="mt-1 font-semibold">
              {formatPrice(totalConsumption)}
            </Text>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}