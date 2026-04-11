import { z } from "zod";
import { slugify } from "@/lib/slugify";

// ─── Restaurant ───────────────────────────────────────────────────────────────

export const restaurantFormSchema = z.object({
  name: z
    .string({ error: "Nome obrigatório" })
    .min(1, "Informe o nome do restaurante."),
  slug: z
    .string({ error: "Slug obrigatório" })
    .min(1, "Informe um slug válido.")
    .refine((s) => slugify(s).length > 0, "Informe um slug válido."),
  ownerUserId: z
    .string({ error: "Proprietário obrigatório" })
    .min(1, "Selecione o usuário proprietário."),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;

// ─── Location ─────────────────────────────────────────────────────────────────

export const locationFormSchema = z.object({
  name: z
    .string({ error: "Nome obrigatório" })
    .min(1, "Informe o nome da filial."),
  phone: z.string().optional(),
  street: z.string().min(1, "Informe a rua."),
  number: z.string().min(1, "Informe o número."),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Informe o bairro."),
  city: z.string().min(1, "Informe a cidade."),
  state: z
    .string()
    .min(1, "Informe o UF.")
    .max(2, "Máximo 2 caracteres"),
  postalCode: z.string().min(1, "Informe o CEP."),
  country: z.string().default("BR"),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;
