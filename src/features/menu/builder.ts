import type { StepType, PricingStrategy, CompositionConfig, MenuItemType, MenuItem } from "@juntai/types";
import {
  createItem,
  createModifierGroup,
  createModifierOption,
  attachModifierGroup,
} from "./api";

// ─── Builder types (estado local — não são tipos de API) ──────────────────────

export type BuilderOption = {
  /** ID temporário, gerado no frontend */
  id: string;
  name: string;
  priceDelta: number;
  // quantity step
  unitPrice: number | null;
  minQuantity: number;
  maxQuantity: number | null;
  // composition sub-option
  parentOptionId: string | null;
  childOptions: BuilderOption[];
};

export type BuilderStep = {
  /** ID temporário, gerado no frontend */
  id: string;
  name: string;
  stepType: StepType;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number | null;
  compositionConfig: CompositionConfig | null;
  options: BuilderOption[];
};

export type BuilderState = {
  type: MenuItemType;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  steps: BuilderStep[];
};

// ─── Mapeamento stepType → selectionType + pricingStrategy ───────────────────

const STEP_CONFIG: Record<
  StepType,
  { selectionType: "SINGLE" | "MULTIPLE"; pricingStrategy: PricingStrategy }
> = {
  choice:      { selectionType: "SINGLE",   pricingStrategy: "sum" },
  multi:       { selectionType: "MULTIPLE", pricingStrategy: "sum" },
  composition: { selectionType: "MULTIPLE", pricingStrategy: "max" },
  quantity:    { selectionType: "MULTIPLE", pricingStrategy: "sum" },
};

/** Labels de negócio exibidos na UI — nunca expor os valores técnicos diretamente */
export const STEP_TYPE_LABELS: Record<StepType, string> = {
  choice:      "Escolha única",
  multi:       "Múltiplas escolhas",
  composition: "Dividir em partes (pizza, combo)",
  quantity:    "Quantidade",
};

// ─── Templates ────────────────────────────────────────────────────────────────

function makeStep(
  name: string,
  stepType: StepType,
  opts: Partial<Omit<BuilderStep, "id" | "name" | "stepType">> = {},
): BuilderStep {
  return {
    id: crypto.randomUUID(),
    name,
    stepType,
    isRequired: opts.isRequired ?? true,
    minSelections: opts.minSelections ?? 1,
    maxSelections: opts.maxSelections ?? 1,
    compositionConfig: opts.compositionConfig ?? null,
    options: opts.options ?? [],
  };
}

export function getProductTemplate(type: "pizza" | "burger" | "poke"): BuilderStep[] {
  switch (type) {
    case "pizza":
      return [
        makeStep("Tamanho", "choice", { isRequired: true }),
        makeStep("Sabores", "composition", {
          isRequired: true,
          compositionConfig: { maxParts: 2 },
          minSelections: 2,
          maxSelections: 2,
        }),
        makeStep("Borda", "choice", { isRequired: false, minSelections: 0 }),
      ];

    case "burger":
      return [
        makeStep("Ponto da carne", "choice", { isRequired: true }),
        makeStep("Adicionais", "multi", {
          isRequired: false,
          minSelections: 0,
          maxSelections: 5,
        }),
      ];

    case "poke":
      return [
        makeStep("Base", "choice", { isRequired: true }),
        makeStep("Proteína", "choice", { isRequired: true }),
        makeStep("Toppings", "multi", {
          isRequired: false,
          minSelections: 0,
          maxSelections: 6,
        }),
        makeStep("Extras", "quantity", { isRequired: false, minSelections: 0 }),
      ];
  }
}

// ─── Preview labels ──────────────────────────────────────────────────────────

export function getStepPreviewLabel(step: BuilderStep): string {
  switch (step.stepType) {
    case "choice":
      return step.isRequired ? "Escolha 1 opção" : "Escolha 1 opção (opcional)";
    case "multi": {
      const max = step.maxSelections;
      return max
        ? `Escolha até ${max} opção${max !== 1 ? "s" : ""}`
        : "Escolha quantas quiser";
    }
    case "composition": {
      const parts = step.compositionConfig?.maxParts ?? 2;
      return `Escolha ${parts} sabor${parts !== 1 ? "es" : ""}`;
    }
    case "quantity":
      return "Adicione as quantidades";
  }
}

// ─── Mapper: builder state → sequência de chamadas API ───────────────────────

export async function saveProduct(
  state: BuilderState,
  context: { categoryId: string; restaurantId: string },
  token: string | null,
): Promise<MenuItem> {
  const { categoryId, restaurantId } = context;

  // 1. Criar o item base
  const item = await createItem(
    categoryId,
    {
      restaurantId,
      name: state.name,
      description: state.description || undefined,
      basePrice: state.basePrice,
      imageUrl: state.imageUrl || undefined,
      type: state.type,
    },
    token,
  );

  // 2. Para cada step: criar grupo → opções → sub-opções → vincular
  for (const step of state.steps) {
    const { selectionType, pricingStrategy } = STEP_CONFIG[step.stepType];

    const group = await createModifierGroup(
      restaurantId,
      {
        name: step.name,
        selectionType,
        stepType: step.stepType,
        pricingStrategy,
        compositionConfig: step.compositionConfig ?? undefined,
        isRequired: step.isRequired,
        minSelections: step.minSelections,
        maxSelections: step.maxSelections ?? undefined,
      },
      token,
    );

    // Opções de nível raiz
    for (let i = 0; i < step.options.length; i++) {
      const opt = step.options[i];
      const created = await createModifierOption(
        group.id,
        {
          restaurantId,
          name: opt.name,
          priceDelta: opt.priceDelta,
          unitPrice: opt.unitPrice ?? undefined,
          minQuantity: opt.minQuantity,
          maxQuantity: opt.maxQuantity ?? undefined,
          displayOrder: i,
        },
        token,
      );

      // Sub-opções (composition)
      for (let j = 0; j < opt.childOptions.length; j++) {
        const child = opt.childOptions[j];
        await createModifierOption(
          group.id,
          {
            restaurantId,
            name: child.name,
            priceDelta: child.priceDelta,
            parentOptionId: created.id,
            displayOrder: j,
          },
          token,
        );
      }
    }

    // Vincular grupo ao item
    await attachModifierGroup(item.id, group.id, restaurantId, token);
  }

  return item;
}

// ─── Estado inicial vazio ─────────────────────────────────────────────────────

export function emptyBuilderState(): BuilderState {
  return {
    type: "simple",
    name: "",
    description: "",
    basePrice: 0,
    imageUrl: "",
    steps: [],
  };
}

export function emptyOption(): BuilderOption {
  return {
    id: crypto.randomUUID(),
    name: "",
    priceDelta: 0,
    unitPrice: null,
    minQuantity: 0,
    maxQuantity: null,
    parentOptionId: null,
    childOptions: [],
  };
}

export function emptyStep(): BuilderStep {
  return makeStep("", "choice", { isRequired: true, options: [] });
}
