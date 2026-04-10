"use client";

import * as React from "react";
import { Button } from "@/components/primitives/button/Button";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
import { Input } from "@/components/primitives/input/Input";
import { Text } from "@/components/primitives/text/Text";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/shared/modal/Modal";
import type { Mesa } from "../model";
import type { TableServiceMode } from "../types";

export interface MesaFormPayload {
  label: string;
  capacity?: number | null;
  area?: string | null;
  isActive?: boolean;
  serviceMode?: TableServiceMode;
}

export interface MesaFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  mesa?: Mesa | null;
  existingMesas: Mesa[];
  currentLocationName?: string;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MesaFormPayload) => Promise<void>;
}

export function MesaFormModal({
  open,
  mode,
  mesa,
  existingMesas,
  currentLocationName,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: MesaFormModalProps) {
  const [label, setLabel] = React.useState("");
  const [capacity, setCapacity] = React.useState("");
  const [area, setArea] = React.useState("");
  const [serviceMode, setServiceMode] =
    React.useState<TableServiceMode>("shared_tab");
  const [isActive, setIsActive] = React.useState(true);
  const [isTouched, setIsTouched] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLabel(mesa?.nome ?? "");
    setCapacity(mesa?.capacidade ? String(mesa.capacidade) : "");
    setArea(mesa?.area ?? "");
    setServiceMode(mesa?.serviceMode ?? "shared_tab");
    setIsActive(mesa ? mesa.status !== "inativa" : true);
    setIsTouched(false);
  }, [open, mesa]);

  const normalizedLabel = label.trim();
  const duplicateName = existingMesas.some(
    (item) =>
      item.id !== mesa?.id &&
      item.nome.trim().toLowerCase() === normalizedLabel.toLowerCase(),
  );

  const nameError = !normalizedLabel
    ? "Informe o nome da mesa."
    : duplicateName
      ? "Já existe uma mesa com esse nome nesta filial."
      : null;

  const parsedCapacity = capacity.trim() ? Number(capacity) : null;
  const capacityError =
    capacity.trim().length > 0 &&
    (!Number.isFinite(parsedCapacity) || Number(parsedCapacity) < 1)
      ? "A capacidade deve ser um número maior que zero."
      : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsTouched(true);

    if (nameError || capacityError) return;

    await onSubmit({
      label: normalizedLabel,
      capacity: parsedCapacity,
      area: area.trim() || null,
      isActive,
      serviceMode,
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-xl">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>
              {mode === "create"
                ? "Nova mesa"
                : `Editar ${mesa?.nome ?? "mesa"}`}
            </ModalTitle>
            <ModalDescription>
              {mode === "create"
                ? `Cadastre uma nova mesa para ${currentLocationName ?? "a filial atual"}.`
                : "Atualize nome, capacidade, área, tipo de comanda e status sem sair da tela principal."}
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-2">
            <label
              htmlFor="mesa-label"
              className="text-sm font-medium text-foreground"
            >
              Nome da mesa
            </label>
            <Input
              id="mesa-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Ex.: Mesa 01, Varanda 02"
              error={Boolean(isTouched && nameError)}
            />
            {isTouched && nameError ? (
              <Text variant="sm" className="text-destructive">
                {nameError}
              </Text>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="mesa-capacity"
                className="text-sm font-medium text-foreground"
              >
                Capacidade
              </label>
              <Input
                id="mesa-capacity"
                type="number"
                min={1}
                inputMode="numeric"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="4"
                error={Boolean(isTouched && capacityError)}
              />
              {isTouched && capacityError ? (
                <Text variant="sm" className="text-destructive">
                  {capacityError}
                </Text>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="mesa-area"
                className="text-sm font-medium text-foreground"
              >
                Área
              </label>
              <Input
                id="mesa-area"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                placeholder="Salão, Varanda, Balcão…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Text variant="sm" className="font-medium text-foreground">
              Tipo de comanda
            </Text>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={serviceMode === "shared_tab"}
                onClick={() => setServiceMode("shared_tab")}
              >
                Comanda compartilhada
              </FilterChip>
              <FilterChip
                active={serviceMode === "individual_tabs"}
                onClick={() => setServiceMode("individual_tabs")}
              >
                Comandas individuais
              </FilterChip>
            </div>
            <Text variant="sm" muted>
              Defina se todos os pedidos ficam na mesma conta ou se cada pessoa
              pode manter sua própria comanda.
            </Text>
          </div>

          <div className="space-y-2">
            <Text variant="sm" className="font-medium text-foreground">
              Status inicial
            </Text>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={isActive} onClick={() => setIsActive(true)}>
                Livre
              </FilterChip>
              <FilterChip active={!isActive} onClick={() => setIsActive(false)}>
                Inativa
              </FilterChip>
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Salvar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
