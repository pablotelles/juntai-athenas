import { z } from "zod";

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const menuFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
  locationId: z.string().uuid("Selecione uma filial"),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;

// ─── Category ────────────────────────────────────────────────────────────────

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// ─── Item (basic info) ───────────────────────────────────────────────────────

export const itemFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
  description: z.string().max(1000).optional(),
  basePrice: z.number().positive("Preço deve ser maior que zero"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  type: z.enum(["simple", "composable"]).default("simple"),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

// ─── Step (modifier group) ───────────────────────────────────────────────────

export const stepFormSchema = z
  .object({
    name: z.string().min(1, "Nome da etapa obrigatório"),
    stepType: z.enum(["choice", "multi", "composition", "quantity"]),
    isRequired: z.boolean().default(false),
    minSelections: z.number().int().min(0).default(0),
    maxSelections: z.number().int().positive().nullable().optional(),
    compositionConfig: z
      .object({ maxParts: z.number().int().min(2, "Mínimo 2 partes") })
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.stepType === "composition" && !data.compositionConfig?.maxParts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o número de partes",
        path: ["compositionConfig", "maxParts"],
      });
    }
  });

export type StepFormValues = z.infer<typeof stepFormSchema>;

// ─── Option (modifier option) ────────────────────────────────────────────────

export const optionFormSchema = z.object({
  name: z.string().min(1, "Nome da opção obrigatório"),
  priceDelta: z.number().default(0),
  // quantity step fields
  unitPrice: z.number().positive().nullable().optional(),
  minQuantity: z.number().int().min(0).default(0),
  maxQuantity: z.number().int().positive().nullable().optional(),
});

export type OptionFormValues = z.infer<typeof optionFormSchema>;
