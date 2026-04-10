"use client";

import * as React from "react";
import { useFormik, FormikProvider } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleHelp } from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { Tooltip } from "@/components/shared/tooltip/Tooltip";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useCreateProduct, useMenu } from "../../hooks";
import { emptyBuilderState, type BuilderState } from "../../builder";
import { itemFormSchema, type ItemFormValues } from "../../schemas";
import { getItemInitialValues } from "./basic-info.initial-values";
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

const WIZARD_STEPS_SIMPLE = [{ label: "Tipo" }, { label: "Informações" }];

const WIZARD_STEPS_COMPOSABLE = [
  { label: "Tipo" },
  { label: "Informações" },
  { label: "Personalização" },
];

const PRODUCT_ASSEMBLY_HELP = (
  <div className="max-w-sm space-y-2 text-left leading-relaxed">
    <p className="font-semibold">Como pensar a montagem do produto</p>
    <p>
      Um produto não é só um item solto. Ele pode ter uma jornada de escolhas,
      como base, tamanho, proteína, sabores, extras e quantidades.
    </p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Crie etapas obrigatórias ou opcionais.</li>
      <li>Defina se o cliente escolhe 1, várias, partes ou quantidades.</li>
      <li>
        Reaproveite produtos e categorias do catálogo para ganhar velocidade.
      </li>
      <li>Controle limites, preço extra e acompanhe tudo no preview.</li>
    </ul>
  </div>
);

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
  const { data: menus } = useMenu(restaurantId, locationId);

  // Lista achatada de itens existentes para reutilização nas opções
  const allItems = React.useMemo(
    () =>
      menus?.flatMap((menu) =>
        menu.categories.flatMap((category) => category.items),
      ) ?? [],
    [menus],
  );

  const catalogCategories = React.useMemo(
    () =>
      menus?.flatMap((menu) =>
        menu.categories.map((category) => ({
          id: category.id,
          label: `${category.name} · ${menu.name}`,
          items: category.items,
        })),
      ) ?? [],
    [menus],
  );

  const infoFormik = useFormik<ItemFormValues>({
    initialValues: getItemInitialValues(),
    validationSchema: toFormikValidationSchema(itemFormSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      setState((prev) => ({
        ...prev,
        name: values.name,
        description: values.description ?? "",
        basePrice: values.basePrice,
        imageUrl: values.imageUrl ?? "",
        type: state.type, // preserve o tipo escolhido no step 1
      }));
      setStep((s) => s + 1);
    },
  });

  // Botão "Próximo" no step 2: valida explicitamente antes de avançar
  const handleStep2Next = React.useCallback(async () => {
    const errors = await infoFormik.validateForm();
    await infoFormik.setTouched(
      Object.fromEntries(Object.keys(infoFormik.values).map((k) => [k, true])),
    );
    if (Object.keys(errors).length === 0) {
      setState((prev) => ({
        ...prev,
        name: infoFormik.values.name,
        description: infoFormik.values.description ?? "",
        basePrice: infoFormik.values.basePrice,
        imageUrl: infoFormik.values.imageUrl ?? "",
        type: state.type,
      }));
      setStep((s) => s + 1);
    }
  }, [infoFormik, state.type]);

  const wizardSteps =
    state.type === "composable" ? WIZARD_STEPS_COMPOSABLE : WIZARD_STEPS_SIMPLE;
  const totalSteps = wizardSteps.length;

  const patch = <K extends keyof BuilderState>(
    field: K,
    value: BuilderState[K],
  ) => setState((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push(backHref);
  };

  // Estado de preview: quando no step 2 usa os valores live do formik
  const previewState: BuilderState = React.useMemo(() => {
    if (step === 2) {
      return {
        ...state,
        name: infoFormik.values.name,
        description: infoFormik.values.description ?? "",
        basePrice: infoFormik.values.basePrice,
        imageUrl: infoFormik.values.imageUrl ?? "",
      };
    }
    return state;
  }, [step, state, infoFormik.values]);

  const handleSave = async () => {
    // Produto simples: step 2 é o último — valida infoFormik antes de salvar.
    let saveState = state;
    if (step === 2) {
      const errors = await infoFormik.validateForm();
      await infoFormik.setTouched(
        Object.fromEntries(
          Object.keys(infoFormik.values).map((k) => [k, true]),
        ),
      );
      if (Object.keys(errors).length > 0) return;
      saveState = {
        ...state,
        name: infoFormik.values.name,
        description: infoFormik.values.description ?? "",
        basePrice: infoFormik.values.basePrice,
        imageUrl: infoFormik.values.imageUrl ?? "",
        type: state.type,
      };
    }

    // Produto personalizável: step 3 — valida que há pelo menos 1 etapa
    // com nome e pelo menos 1 opção com nome.
    if (saveState.type === "composable") {
      if (saveState.steps.length === 0) {
        toast.warning("Adicione pelo menos uma etapa ao produto.");
        return;
      }
      const stepSemNome = saveState.steps.find((s) => !s.name.trim());
      if (stepSemNome) {
        toast.warning("Todas as etapas precisam ter um nome.");
        return;
      }
      const stepSemOpcao = saveState.steps.find((s) => s.options.length === 0);
      if (stepSemOpcao) {
        toast.warning(
          `A etapa "${stepSemOpcao.name}" precisa ter pelo menos uma opção.`,
        );
        return;
      }
      const opcaoSemNome = saveState.steps
        .flatMap((s) => s.options)
        .find((o) => !o.name.trim());
      if (opcaoSemNome) {
        toast.warning("Todas as opções precisam ter um nome.");
        return;
      }
    }

    const msg =
      saveState.type === "composable" && saveState.steps.length > 0
        ? `Salvando produto e ${saveState.steps.length} etapa${saveState.steps.length !== 1 ? "s" : ""}…`
        : "Salvando produto…";
    toast.info(msg, { duration: 10_000 });

    try {
      await createProduct.mutateAsync(saveState);
      toast.success("Produto criado!", {
        description: `"${saveState.name}" adicionado ao cardápio.`,
      });
      router.push(backHref);
    } catch {
      toast.error("Erro ao salvar produto.", {
        description: "Verifique os dados e tente novamente.",
      });
    }
  };

  const isLastStep = step === totalSteps;

  const content = (
    <div className="flex flex-col lg:h-full">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
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
      <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-border">
        <WizardProgress steps={wizardSteps} currentStep={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col gap-6 lg:gap-8">
        {step === 1 && (
          <div className="flex flex-col gap-4 max-w-xl">
            <div>
              <h2 className="text-lg font-semibold">
                Que tipo de produto é este?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos simples têm preço fixo. Personalizáveis têm etapas de
                escolha.
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
          <div className="flex flex-col gap-4 w-full">
            <div>
              <h2 className="text-lg font-semibold">Informações do produto</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Nome, descrição, preço e imagem em uma visão mais completa e
                equilibrada.
              </p>
            </div>
            <FormikProvider value={infoFormik}>
              <BasicInfoForm />
            </FormikProvider>
          </div>
        )}

        {step === 3 && state.type === "composable" && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Montagem do produto</h2>
                <Tooltip side="right" content={PRODUCT_ASSEMBLY_HELP}>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Ajuda sobre a montagem do produto"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Adicione etapas de escolha que o cliente vai percorrer ao montar
                o pedido.
              </p>
            </div>
            <StepsBuilder
              steps={state.steps}
              allItems={allItems}
              catalogCategories={catalogCategories}
              onStepsChange={(steps) => patch("steps", steps)}
            />
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="sticky bottom-0 bg-background/90 backdrop-blur border-t border-border px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={handleBack}>
          {step === 1 ? "Cancelar" : "Voltar"}
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSave}
            loading={createProduct.isPending}
          >
            {state.type === "composable"
              ? "Criar produto personalizado"
              : "Criar produto"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={step === 2 ? handleStep2Next : handleNext}
            loading={step === 2 ? infoFormik.isSubmitting : false}
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
      preview={<PreviewPanel state={previewState} />}
    />
  );
}
