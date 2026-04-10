"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useCreateProduct } from "../../hooks";
import { emptyBuilderState, type BuilderState } from "../../builder";
import { BuilderLayout } from "./BuilderLayout";
import { WizardProgress } from "./WizardProgress";
import { ProductTypeSelector } from "./ProductTypeSelector";
import { BasicInfoForm } from "./BasicInfoForm";
import { StepsBuilder } from "./StepsBuilder";
import { PreviewPanel } from "./PreviewPanel";
import type { MenuItemType } from "@juntai/types";

interface ProductBuilderPageProps {
  categoryId: string;
  menuId: string;
  restaurantId: string;
  locationId: string | null;
  /** href to navigate back to (e.g. category page) */
  backHref: string;
}

const WIZARD_STEPS_SIMPLE = [
  { label: "Tipo" },
  { label: "Informações" },
];

const WIZARD_STEPS_COMPOSABLE = [
  { label: "Tipo" },
  { label: "Informações" },
  { label: "Personalização" },
];

export function ProductBuilderPage({
  categoryId,
  restaurantId,
  locationId,
  backHref,
}: ProductBuilderPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = React.useState<BuilderState>(emptyBuilderState);
  const [step, setStep] = React.useState(1);

  const createProduct = useCreateProduct(categoryId, restaurantId, locationId);

  const wizardSteps =
    state.type === "composable" ? WIZARD_STEPS_COMPOSABLE : WIZARD_STEPS_SIMPLE;
  const totalSteps = wizardSteps.length;

  const patch = <K extends keyof BuilderState>(field: K, value: BuilderState[K]) =>
    setState((prev) => ({ ...prev, [field]: value }));

  const canAdvance = () => {
    if (step === 1) return true;
    if (step === 2) return !!state.name && state.basePrice > 0;
    return true;
  };

  const handleNext = () => {
    if (step === 2 && !state.name) { toast.warning("Informe o nome do produto."); return; }
    if (step === 2 && state.basePrice <= 0) { toast.warning("Informe um preço válido."); return; }
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push(backHref);
  };

  const handleSave = async () => {
    if (!state.name) { toast.warning("Informe o nome do produto."); return; }
    if (state.basePrice <= 0) { toast.warning("Informe um preço válido."); return; }

    const msg =
      state.type === "composable" && state.steps.length > 0
        ? `Salvando produto e ${state.steps.length} etapa${state.steps.length !== 1 ? "s" : ""}…`
        : "Salvando produto…";
    toast.info(msg, { duration: 10_000 });

    try {
      await createProduct.mutateAsync(state);
      toast.success("Produto criado!", { description: `"${state.name}" adicionado ao cardápio.` });
      router.push(backHref);
    } catch {
      toast.error("Erro ao salvar produto.", { description: "Verifique os dados e tente novamente." });
    }
  };

  const isLastStep = step === totalSteps;

  const content = (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-8 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <button
          type="button"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold flex-1">Novo produto</h1>
      </div>

      {/* Wizard progress */}
      <div className="px-8 py-5 border-b border-border">
        <WizardProgress steps={wizardSteps} currentStep={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 px-8 py-8 flex flex-col gap-8">
        {step === 1 && (
          <div className="flex flex-col gap-4 max-w-xl">
            <div>
              <h2 className="text-lg font-semibold">Que tipo de produto é este?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos simples têm preço fixo. Personalizáveis têm etapas de escolha.
              </p>
            </div>
            <ProductTypeSelector
              value={state.type}
              onChange={(type: MenuItemType) => {
                patch("type", type);
                if (type === "simple") patch("steps", []);
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 max-w-xl">
            <div>
              <h2 className="text-lg font-semibold">Informações do produto</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Nome, descrição, preço e imagem.
              </p>
            </div>
            <BasicInfoForm
              state={state}
              onChange={(field, value) =>
                patch(field as keyof BuilderState, value as BuilderState[typeof field])
              }
            />
          </div>
        )}

        {step === 3 && state.type === "composable" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">Montagem do produto</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione etapas de escolha que o cliente vai percorrer ao montar o pedido.
              </p>
            </div>
            <StepsBuilder
              steps={state.steps}
              onStepsChange={(steps) => patch("steps", steps)}
            />
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur border-t border-border px-8 py-4 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={handleBack}>
          {step === 1 ? "Cancelar" : "Voltar"}
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSave}
            loading={createProduct.isPending}
          >
            {state.type === "composable" ? "Criar produto personalizado" : "Criar produto"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance()}
          >
            Próximo
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <BuilderLayout
      content={content}
      preview={<PreviewPanel state={state} />}
    />
  );
}
