"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { getProductTemplate, type BuilderStep } from "../../builder";

type TemplateType = "pizza" | "burger" | "poke";

const TEMPLATES: { value: TemplateType; emoji: string; title: string; description: string }[] = [
  {
    value: "pizza",
    emoji: "🍕",
    title: "Pizza",
    description: "Tamanho, sabores (meio a meio) e borda",
  },
  {
    value: "burger",
    emoji: "🍔",
    title: "Hambúrguer",
    description: "Ponto da carne e adicionais",
  },
  {
    value: "poke",
    emoji: "🥗",
    title: "Poke",
    description: "Base, proteína, toppings e extras",
  },
];

interface ProductTemplateSelectorProps {
  onSelect: (steps: BuilderStep[]) => void;
  onSkip: () => void;
}

export function ProductTemplateSelector({ onSelect, onSkip }: ProductTemplateSelectorProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Como você quer montar este produto?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Use um template pronto ou comece do zero e adicione as etapas manualmente.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Scratch option */}
        <button
          type="button"
          onClick={onSkip}
          className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
        >
          <span className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
          </span>
          <div>
            <p className="font-semibold text-sm">Criar do zero</p>
            <p className="text-xs text-muted-foreground mt-0.5">Adicionar etapas manualmente</p>
          </div>
        </button>

        {/* Template options */}
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.value}
            type="button"
            onClick={() => onSelect(getProductTemplate(tpl.value))}
            className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
          >
            <span className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {tpl.emoji}
            </span>
            <div>
              <p className="font-semibold text-sm">{tpl.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
