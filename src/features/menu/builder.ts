import type {
  StepType,
  PricingStrategy,
  CompositionConfig,
  MenuItemType,
  MenuItem,
} from "@juntai/types";
import {
  createItem,
  patchItem,
  createModifierGroup,
  deleteModifierGroup,
  createModifierOption,
  attachModifierGroup,
} from "./api";

// ─── Builder types (estado local — não são tipos de API) ──────────────────────

export type BuilderOption = {
  /** ID temporário, gerado no frontend */
  id: string;
  // Vínculo parcial: quando presente, name/imageUrl/description são do item vinculado.
  // null = opção independente ou vínculo perdido.
  linkedItemId: string | null;
  name: string;
  imageUrl: string;
  description: string;
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
  /** Override de pricingStrategy para composition (default: "max") */
  pricingStrategy?: PricingStrategy;
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
  choice: { selectionType: "SINGLE", pricingStrategy: "sum" },
  multi: { selectionType: "MULTIPLE", pricingStrategy: "sum" },
  composition: { selectionType: "MULTIPLE", pricingStrategy: "max" },
  quantity: { selectionType: "MULTIPLE", pricingStrategy: "sum" },
};

/** Labels de negócio exibidos na UI — nunca expor os valores técnicos diretamente */
export const STEP_TYPE_LABELS: Record<StepType, string> = {
  choice: "1 opção",
  multi: "Várias opções",
  composition: "Dividir em partes",
  quantity: "Quantidade",
};

/** Ícones por tipo de step */
export const STEP_TYPE_ICONS: Record<StepType, string> = {
  choice: "🎯",
  multi: "✅",
  composition: "🍕",
  quantity: "🔢",
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

export function getProductTemplate(
  type: "pizza" | "burger" | "poke",
): BuilderStep[] {
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
    const { selectionType, pricingStrategy: defaultPricing } =
      STEP_CONFIG[step.stepType];
    const pricingStrategy = step.pricingStrategy ?? defaultPricing;

    // SINGLE selection type always requires exactly minSelections=1, maxSelections=1.
    // For MULTIPLE, if the step is required, minSelections must be at least 1.
    const minSelections =
      selectionType === "SINGLE"
        ? 1
        : step.isRequired
          ? Math.max(step.minSelections, 1)
          : step.minSelections;
    const maxSelections =
      selectionType === "SINGLE" ? 1 : (step.maxSelections ?? undefined);

    const group = await createModifierGroup(
      restaurantId,
      {
        name: step.name,
        selectionType,
        stepType: step.stepType,
        pricingStrategy,
        compositionConfig: step.compositionConfig ?? undefined,
        isRequired: step.isRequired,
        minSelections,
        maxSelections,
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
          linkedItemId: opt.linkedItemId ?? undefined,
          name: opt.name,
          imageUrl: opt.imageUrl || undefined,
          description: opt.description || undefined,
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

// ─── Mapper: MenuItem → BuilderState (para edição) ───────────────────────────

export function itemToBuilderState(item: MenuItem): BuilderState {
  const resolvedType: MenuItemType =
    item.type === "composable" || item.modifierGroups.length > 0
      ? "composable"
      : "simple";

  return {
    type: resolvedType,
    name: item.name,
    description: item.description ?? "",
    basePrice: item.basePrice,
    imageUrl: item.imageUrl ?? "",
    steps: item.modifierGroups.map((group) => ({
      id: group.id,
      name: group.name,
      stepType: group.stepType,
      isRequired: group.isRequired,
      minSelections: group.minSelections,
      maxSelections: group.maxSelections,
      compositionConfig: group.compositionConfig,
      pricingStrategy: group.pricingStrategy ?? undefined,
      options: group.options
        .filter((o) => o.parentOptionId === null)
        .map((opt) => ({
          id: opt.id,
          linkedItemId: opt.linkedItemId ?? null,
          name: opt.name,
          imageUrl: opt.imageUrl ?? "",
          description: opt.description ?? "",
          priceDelta: opt.priceDelta,
          unitPrice: opt.unitPrice ?? null,
          minQuantity: opt.minQuantity,
          maxQuantity: opt.maxQuantity,
          parentOptionId: null,
          childOptions: (opt.childOptions ?? []).map((child) => ({
            id: child.id,
            linkedItemId: child.linkedItemId ?? null,
            name: child.name,
            imageUrl: child.imageUrl ?? "",
            description: child.description ?? "",
            priceDelta: child.priceDelta,
            unitPrice: child.unitPrice ?? null,
            minQuantity: child.minQuantity,
            maxQuantity: child.maxQuantity,
            parentOptionId: opt.id,
            childOptions: [],
          })),
        })),
    })),
  };
}

// ─── Orquestrador: atualizar produto completo ─────────────────────────────────
//
// Estratégia:
//   1. PATCH campos básicos do item
//   2. DELETE todos os modifier groups existentes (cascade options)
//   3. Recriar todos os steps/groups/options do novo estado
//
// Motivo para delete-recreate em vez de diff: a API não tem PATCH para groups/options.
// O custo de recriação é aceitável para o tamanho típico de cardápios.

export async function updateProduct(
  itemId: string,
  state: BuilderState,
  context: { restaurantId: string; existingGroupIds: string[] },
  token: string | null,
): Promise<MenuItem> {
  const { restaurantId, existingGroupIds } = context;

  // 1. Atualizar campos básicos
  const updatedItem = await patchItem(
    itemId,
    {
      restaurantId,
      name: state.name,
      description: state.description || undefined,
      // The backend accepts `type` on PATCH; the SDK typing is just behind.
      type: state.steps.length > 0 ? "composable" : state.type,
      basePrice: state.basePrice,
      imageUrl: state.imageUrl || undefined,
    } as Parameters<typeof patchItem>[1],
    token,
  );

  // 2. Deletar todos os grupos existentes (deleta opções + desvincula do item)
  for (const groupId of existingGroupIds) {
    await deleteModifierGroup(groupId, restaurantId, token);
  }

  // 3. Recriar steps (mesma lógica do saveProduct)
  for (const step of state.steps) {
    const { selectionType, pricingStrategy: defaultPricing } =
      STEP_CONFIG[step.stepType];
    const pricingStrategy = step.pricingStrategy ?? defaultPricing;

    const minSelections =
      selectionType === "SINGLE"
        ? 1
        : step.isRequired
          ? Math.max(step.minSelections, 1)
          : step.minSelections;
    const maxSelections =
      selectionType === "SINGLE" ? 1 : (step.maxSelections ?? undefined);

    const group = await createModifierGroup(
      restaurantId,
      {
        name: step.name,
        selectionType,
        stepType: step.stepType,
        pricingStrategy,
        compositionConfig: step.compositionConfig ?? undefined,
        isRequired: step.isRequired,
        minSelections,
        maxSelections,
      },
      token,
    );

    for (let i = 0; i < step.options.length; i++) {
      const opt = step.options[i];
      const created = await createModifierOption(
        group.id,
        {
          restaurantId,
          linkedItemId: opt.linkedItemId ?? undefined,
          name: opt.name,
          imageUrl: opt.imageUrl || undefined,
          description: opt.description || undefined,
          priceDelta: opt.priceDelta,
          unitPrice: opt.unitPrice ?? undefined,
          minQuantity: opt.minQuantity,
          maxQuantity: opt.maxQuantity ?? undefined,
          displayOrder: i,
        },
        token,
      );

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

    await attachModifierGroup(itemId, group.id, restaurantId, token);
  }

  // O caller invalida o cache após salvar; não precisamos disparar um PATCH vazio.
  return updatedItem;
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
    linkedItemId: null,
    name: "",
    imageUrl: "",
    description: "",
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
