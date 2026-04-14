"use client";

import * as React from "react";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/card/Card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog/ConfirmDialog";

type SplitMode = "equal" | "items" | "custom";
type PaymentMethod = "PIX" | "CASH" | "CARD" | "MULTI";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export interface MesaClosingTabProps {
  mesaNome: string;
  activeMembersCount: number;
  totalConsumption: number;
  isCancelling?: boolean;
  onSplitDetails: () => void;
  onConfirmCloseBill: () => void;
  onCancelSession: () => void;
}

export function MesaClosingTab({
  mesaNome,
  activeMembersCount,
  totalConsumption,
  isCancelling = false,
  onSplitDetails,
  onConfirmCloseBill,
  onCancelSession,
}: MesaClosingTabProps) {
  const [includeService, setIncludeService] = React.useState(false);
  const [splitMode, setSplitMode] = React.useState<SplitMode>("equal");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("PIX");
  const [isConfirmOpen, setConfirmOpen] = React.useState(false);

  const serviceAmount = includeService
    ? Math.round(totalConsumption * 0.1)
    : 0;
  const totalWithService = totalConsumption + serviceAmount;
  const equalShare = Math.round(
    totalWithService / Math.max(activeMembersCount, 1),
  );

  return (
    <>
      <section className="space-y-4">
        <Card className="bg-background/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Fechamento da mesa</CardTitle>
            <CardDescription>
              Revise o total, escolha a divisão e confirme o encerramento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-surface px-4 py-3">
                <Text variant="xs" muted>
                  Total da mesa
                </Text>
                <Text variant="body" className="mt-1 font-semibold">
                  {formatPrice(totalConsumption)}
                </Text>
              </div>
              <div className="rounded-lg bg-surface px-4 py-3">
                <Text variant="xs" muted>
                  Taxa de serviço
                </Text>
                <Text variant="body" className="mt-1 font-semibold">
                  {formatPrice(serviceAmount)}
                </Text>
              </div>
              <div className="rounded-lg bg-surface px-4 py-3">
                <Text variant="xs" muted>
                  Total com serviço
                </Text>
                <Text variant="body" className="mt-1 font-semibold">
                  {formatPrice(totalWithService)}
                </Text>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={includeService ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludeService((current) => !current)}
              >
                {includeService ? "Serviço incluído" : "Incluir serviço 10%"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Divisão</CardTitle>
            <CardDescription>
              Defina como a conta deve ser organizada antes do pagamento final.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <FilterChip active={splitMode === "equal"} onClick={() => setSplitMode("equal")}>
                Igual entre {Math.max(activeMembersCount, 1)} pessoa
                {Math.max(activeMembersCount, 1) === 1 ? "" : "s"}
              </FilterChip>
              <FilterChip active={splitMode === "items"} onClick={() => setSplitMode("items")}>
                Por itens consumidos
              </FilterChip>
              <FilterChip active={splitMode === "custom"} onClick={() => setSplitMode("custom")}>
                Porcentagem personalizada
              </FilterChip>
            </div>

            <div className="rounded-lg bg-surface px-4 py-3">
              {splitMode === "equal" ? (
                <>
                  <Text variant="sm" className="font-medium">
                    {formatPrice(equalShare)} por pessoa
                  </Text>
                  <Text variant="xs" muted className="mt-1">
                    Valor distribuído igualmente entre os participantes ativos.
                  </Text>
                </>
              ) : null}

              {splitMode === "items" ? (
                <>
                  <Text variant="sm" className="font-medium">
                    Divisão por itens
                  </Text>
                  <Text variant="xs" muted className="mt-1">
                    Use quando cada pessoa pagar apenas o que consumiu.
                  </Text>
                </>
              ) : null}

              {splitMode === "custom" ? (
                <>
                  <Text variant="sm" className="font-medium">
                    Divisão personalizada
                  </Text>
                  <Text variant="xs" muted className="mt-1">
                    Estrutura pronta para percentuais e ajustes manuais.
                  </Text>
                </>
              ) : null}
            </div>

            <Button variant="link" className="justify-start px-0" onClick={onSplitDetails}>
              Ver detalhamento por pessoa
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-background/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Pagamento</CardTitle>
            <CardDescription>
              Escolha o método principal antes de concluir a conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["PIX", "CASH", "CARD", "MULTI"] as const).map((method) => (
                <FilterChip
                  key={method}
                  active={paymentMethod === method}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method === "PIX" ? "PIX" : null}
                  {method === "CASH" ? "Dinheiro" : null}
                  {method === "CARD" ? "Cartão" : null}
                  {method === "MULTI" ? "Dividir cartões" : null}
                </FilterChip>
              ))}
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-surface px-4 py-4">
              <Button className="w-full" onClick={() => setConfirmOpen(true)}>
                Fechar conta da mesa
              </Button>
              <Button
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                variant="ghost"
                loading={isCancelling}
                onClick={onCancelSession}
              >
                Cancelar sessão
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Fechar conta da ${mesaNome}?`}
        description="Revise o método de pagamento e confirme o encerramento da mesa."
        confirmLabel="Confirmar fechamento"
        onConfirm={() => {
          setConfirmOpen(false);
          onConfirmCloseBill();
        }}
      />
    </>
  );
}