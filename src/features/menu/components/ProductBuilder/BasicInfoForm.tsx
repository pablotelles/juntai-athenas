"use client";

import * as React from "react";
import { useFormikContext } from "formik";
import { Input } from "@/components/primitives/input/Input";
import { FormField } from "@/components/shared/form-field/FormField";
import type { ItemFormValues } from "../../schemas";

// Must be rendered inside a <FormikProvider value={infoFormik}> ancestor.

export function BasicInfoForm() {
  const { setFieldValue } = useFormikContext<ItemFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <FormField name="name" label="Nome" required>
        {({ field, hasError }) => (
          <Input
            {...field}
            value={field.value as string}
            placeholder="Ex: Pizza Margherita"
            aria-invalid={hasError}
          />
        )}
      </FormField>

      <FormField name="description" label="Descrição">
        {({ field, hasError }) => (
          <textarea
            {...field}
            value={field.value as string}
            placeholder="Descreva o produto brevemente…"
            rows={2}
            aria-invalid={hasError}
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
          />
        )}
      </FormField>

      <FormField name="basePrice" label="Preço base (R$)" required>
        {({ field, hasError }) => (
          <Input
            name="basePrice"
            type="number"
            min="0"
            step="0.01"
            value={(field.value as number) || ""}
            onChange={(e) =>
              setFieldValue("basePrice", parseFloat(e.target.value) || 0)
            }
            onBlur={field.onBlur}
            placeholder="0,00"
            aria-invalid={hasError}
          />
        )}
      </FormField>

      <FormField name="imageUrl" label="URL da imagem">
        {({ field, hasError }) => (
          <Input
            {...field}
            value={field.value as string}
            placeholder="https://…"
            aria-invalid={hasError}
          />
        )}
      </FormField>
    </div>
  );
}
