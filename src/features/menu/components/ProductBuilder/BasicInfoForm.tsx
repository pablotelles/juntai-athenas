"use client";

import * as React from "react";
import { Input } from "@/components/primitives/input/Input";
import { Text } from "@/components/primitives/text/Text";
import { Label } from "@/components/primitives/label/Label";
import type { BuilderState } from "../../builder";

interface BasicInfoFormProps {
  state: Pick<BuilderState, "name" | "description" | "basePrice" | "imageUrl">;
  onChange: (field: keyof BasicInfoFormProps["state"], value: string | number) => void;
  errors?: Partial<Record<keyof BasicInfoFormProps["state"], string>>;
}

export function BasicInfoForm({ state, onChange, errors }: BasicInfoFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-name" required>
          Nome
        </Label>
        <Input
          id="product-name"
          value={state.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Ex: Pizza Margherita"
          aria-invalid={!!errors?.name}
        />
        {errors?.name && (
          <Text variant="xs" className="text-destructive">
            {errors.name}
          </Text>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-desc">Descrição</Label>
        <textarea
          id="product-desc"
          value={state.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Descreva o produto brevemente…"
          rows={2}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-price" required>
          Preço base (R$)
        </Label>
        <Input
          id="product-price"
          type="number"
          min="0"
          step="0.01"
          value={state.basePrice || ""}
          onChange={(e) => onChange("basePrice", parseFloat(e.target.value) || 0)}
          placeholder="0,00"
          aria-invalid={!!errors?.basePrice}
        />
        {errors?.basePrice && (
          <Text variant="xs" className="text-destructive">
            {errors.basePrice}
          </Text>
        )}
      </div>

      {/* Image URL */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="product-image">URL da imagem</Label>
        <Input
          id="product-image"
          value={state.imageUrl}
          onChange={(e) => onChange("imageUrl", e.target.value)}
          placeholder="https://…"
        />
      </div>
    </div>
  );
}
