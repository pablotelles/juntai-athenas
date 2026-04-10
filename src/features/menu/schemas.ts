import { z } from "zod";

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const menuFormSchema = z.object({
  name: z
    .string({ error: "Nome obrigatório" })
    .min(1, "Nome obrigatório")
    .max(200, "Máximo 200 caracteres"),
  locationId: z
    .string({ error: "Selecione uma filial" })
    .uuid("Selecione uma filial"),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;

// ─── Category ────────────────────────────────────────────────────────────────

export const categoryFormSchema = z.object({
  name: z
    .string({ error: "Nome obrigatório" })
    .min(1, "Nome obrigatório")
    .max(200, "Máximo 200 caracteres"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// ─── Item (basic info) ───────────────────────────────────────────────────────

export const itemFormSchema = z.object({
  name: z
    .string({ error: "Nome obrigatório" })
    .min(1, "Nome obrigatório")
    .max(200, "Máximo 200 caracteres"),
  description: z
    .string({ error: "Descrição inválida" })
    .max(1000, "Máximo 1000 caracteres")
    .optional(),
  basePrice: z
    .number({ error: "Informe um preço válido" })
    .positive("Preço deve ser maior que zero"),
  imageUrl: z
    .string({ error: "URL inválida" })
    .url("Informe uma URL válida (https://…)")
    .optional()
    .or(z.literal("")),
  type: z.enum(["simple", "composable"]).default("simple"),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

// ─── Step (modifier group) ───────────────────────────────────────────────────

export const stepFormSchema = z
  .object({
    name: z
      .string({ error: "Nome da etapa obrigatório" })
      .min(1, "Nome da etapa obrigatório"),
    stepType: z.enum(["choice", "multi", "composition", "quantity"]),
    isRequired: z.boolean().default(false),
    minSelections: z
      .number({ error: "Informe um número" })
      .int()
      .min(0)
      .default(0),
    maxSelections: z
      .number({ error: "Informe um número" })
      .int()
      .positive("Máximo deve ser maior que zero")
      .nullable()
      .optional(),
    compositionConfig: z
      .object({
        maxParts: z
          .number({ error: "Informe o número de partes" })
          .int()
          .min(2, "Mínimo 2 partes"),
      })
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
  name: z
    .string({ error: "Nome da opção obrigatório" })
    .min(1, "Nome da opção obrigatório"),
  priceDelta: z.number({ error: "Informe um valor numérico" }).default(0),
  // quantity step fields
  unitPrice: z
    .number({ error: "Informe um valor numérico" })
    .positive("Preço por unidade deve ser maior que zero")
    .nullable()
    .optional(),
  minQuantity: z
    .number({ error: "Informe um número" })
    .int()
    .min(0, "Mínimo 0")
    .default(0),
  maxQuantity: z
    .number({ error: "Informe um número" })
    .int()
    .positive("Máximo deve ser maior que zero")
    .nullable()
    .optional(),
});

export type OptionFormValues = z.infer<typeof optionFormSchema>;
