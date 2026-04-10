"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Text } from "@/components/primitives/text/Text";
import type { MenuItemType } from "@juntai/types";

const OPTIONS: { value: MenuItemType; label: string; description: string }[] = [
  {
    value: "simple",
    label: "Simples",
    description: "Produto sem personalização. Apenas nome, preço e foto.",
  },
  {
    value: "composable",
    label: "Personalizável",
    description: "Produto com etapas de escolha (tamanho, sabores, adicionais…).",
  },
];

interface ProductTypeSelectorProps {
  value: MenuItemType;
  onChange: (type: MenuItemType) => void;
}

export function ProductTypeSelector({ value, onChange }: ProductTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex flex-col gap-1 rounded-lg border-2 p-4 text-left transition-colors",
            value === opt.value
              ? "border-primary bg-primary/5"
              : "border-border hover:border-border-strong",
          )}
        >
          <Text variant="sm" className="font-semibold">
            {opt.label}
          </Text>
          <Text variant="xs" muted>
            {opt.description}
          </Text>
        </button>
      ))}
    </div>
  );
}
