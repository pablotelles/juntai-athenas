import type { MenuItem } from "@juntai/types";
import type { ItemFormValues } from "../../schemas";

// ─── Initial values ───────────────────────────────────────────────────────────

export function getItemInitialValues(item?: MenuItem): ItemFormValues {
  return {
    name: item?.name ?? "",
    description: item?.description ?? "",
    basePrice: item?.basePrice ?? 0,
    imageUrl: item?.imageUrl ?? "",
    type: item?.type ?? "simple",
  };
}

// ─── Mappers ───────────────────────────────────────────────────────────────────

/** form values → API body (omits empty optional fields) */
export function itemFormToDb(values: ItemFormValues) {
  return {
    name: values.name,
    ...(values.description ? { description: values.description } : {}),
    basePrice: values.basePrice,
    ...(values.imageUrl ? { imageUrl: values.imageUrl } : {}),
    type: values.type,
  };
}

/** db entity → form initial values */
export const dbToItemForm = getItemInitialValues;
