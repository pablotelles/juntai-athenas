"use client";

import * as React from "react";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/shared/modal/Modal";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useCreateProduct } from "../../hooks";
import { emptyBuilderState, type BuilderState } from "../../builder";
import { ProductTypeSelector } from "./ProductTypeSelector";
import { BasicInfoForm } from "./BasicInfoForm";
import { StepsBuilder } from "./StepsBuilder";
import { PreviewPanel } from "./PreviewPanel";
import type { MenuItemType } from "@juntai/types";

interface ProductBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  restaurantId: string;
  locationId: string | null;
}

export function ProductBuilder({
  open,
  onOpenChange,
  categoryId,
  restaurantId,
  locationId,
}: ProductBuilderProps) {
  const { toast } = useToast();
  const [state, setState] = React.useState<BuilderState>(emptyBuilderState);
  const createProduct = useCreateProduct(categoryId, restaurantId, locationId);

  const patch = <K extends keyof BuilderState>(field: K, value: BuilderState[K]) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!state.name) {
      toast.warning("Informe o nome do produto.");
      return;
    }
    if (state.basePrice <= 0) {
      toast.warning("Informe um preço válido.");
      return;
    }

    const infoToast = state.type === "composable" && state.steps.length > 0
      ? `Salvando produto e ${state.steps.length} etapa${state.steps.length !== 1 ? "s" : ""}…`
      : "Salvando produto…";

    toast.info(infoToast, { duration: 10_000 });

    try {
      await createProduct.mutateAsync(state);
      toast.success("Produto criado!", { description: `"${state.name}" adicionado ao cardápio.` });
      setState(emptyBuilderState());
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar produto.", {
        description: "Verifique os dados e tente novamente.",
      });
    }
  };

  const handleClose = () => {
    setState(emptyBuilderState());
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-4xl w-full">
        <ModalHeader>
          <ModalTitle>Novo produto</ModalTitle>
        </ModalHeader>

        <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Type selector */}
          <div className="flex flex-col gap-2">
            <Text variant="sm" className="font-medium">
              Tipo de produto
            </Text>
            <ProductTypeSelector
              value={state.type}
              onChange={(type: MenuItemType) => patch("type", type)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: form */}
            <div className="flex flex-col gap-6">
              <BasicInfoForm
                state={state}
                onChange={(field, value) =>
                  patch(field as keyof BuilderState, value as BuilderState[typeof field])
                }
              />

              {state.type === "composable" && (
                <StepsBuilder
                  steps={state.steps}
                  onStepsChange={(steps) => patch("steps", steps)}
                />
              )}
            </div>

            {/* Right: preview */}
            <PreviewPanel state={state} />
          </div>
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            loading={createProduct.isPending}
          >
            {state.type === "composable" ? "Criar produto personalizado" : "Criar produto"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
