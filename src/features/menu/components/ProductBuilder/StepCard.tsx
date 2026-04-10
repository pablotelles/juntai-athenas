"use client";

import * as React from "react";
import { Trash2, Plus, GripVertical, CircleHelp } from "lucide-react";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import { Checkbox } from "@/components/shared/checkbox/Checkbox";
import { Tooltip } from "@/components/shared/tooltip/Tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shared/select/Select";
import { OptionItem } from "./OptionItem";
import {
  STEP_TYPE_LABELS,
  STEP_TYPE_ICONS,
  emptyOption,
  type BuilderStep,
  type BuilderOption,
} from "../../builder";
import type { StepType, PricingStrategy, MenuItem } from "@juntai/types";

const STEP_TYPES: StepType[] = ["choice", "multi", "composition", "quantity"];

const STEP_TYPE_HELP: Record<StepType, { title: string; example: string }> = {
  choice: {
    title: "1 opção",
    example: "Ex.: tamanho P/M/G ou ponto da carne.",
  },
  multi: {
    title: "Várias opções",
    example: "Ex.: adicionais como queijo, bacon e molhos.",
  },
  composition: {
    title: "Dividir em partes",
    example: "Ex.: pizza meio a meio ou combo montado por partes.",
  },
  quantity: {
    title: "Quantidade",
    example: "Ex.: extra bacon, molho ou hashi cobrados por unidade.",
  },
};

interface StepCardProps {
  step: BuilderStep;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  allItems: MenuItem[];
  onUpdate: (stepId: string, patch: Partial<BuilderStep>) => void;
  onRemove: (stepId: string) => void;
  onAddOption: (stepId: string) => void;
  onUpdateOption: (
    stepId: string,
    optId: string,
    patch: Partial<BuilderOption>,
  ) => void;
  onRemoveOption: (stepId: string, optId: string) => void;
  onAddChildOption: (stepId: string, parentId: string) => void;
}

export function StepCard({
  step,
  dragHandleProps,
  allItems,
  onUpdate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onAddChildOption,
}: StepCardProps) {
  const handleTypeChange = (value: string) => {
    const stepType = value as StepType;
    const patch: Partial<BuilderStep> = {
      stepType,
      compositionConfig:
        stepType === "composition"
          ? (step.compositionConfig ?? { maxParts: 2 })
          : null,
      pricingStrategy:
        stepType === "composition"
          ? (step.pricingStrategy ?? "max")
          : undefined,
    };
    // choice is always 1→1
    if (stepType === "choice") {
      patch.minSelections = 1;
      patch.maxSelections = 1;
      patch.isRequired = true;
    }
    onUpdate(step.id, patch);
  };

  const pricing = step.pricingStrategy ?? "max";

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 bg-secondary/30 border-b border-border">
        <div
          {...dragHandleProps}
          className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical size={18} />
        </div>

        <Input
          value={step.name}
          onChange={(e) => onUpdate(step.id, { name: e.target.value })}
          placeholder="Nome da etapa  (ex: Escolha o tamanho)"
          className="flex-1 border-transparent bg-transparent shadow-none text-base font-medium focus-visible:bg-background focus-visible:border-border px-0"
        />

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl shrink-0" aria-hidden="true">
            {STEP_TYPE_ICONS[step.stepType]}
          </span>

          <Select value={step.stepType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[220px] max-w-full shrink-0 [&>span]:truncate">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-[280px]">
              {STEP_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{STEP_TYPE_ICONS[t]}</span>
                    <span className="truncate">{STEP_TYPE_LABELS[t]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip
            side="left"
            content={
              <div className="max-w-xs space-y-2 text-left leading-relaxed">
                <p className="font-semibold">Como funciona cada tipo</p>
                {STEP_TYPES.map((type) => (
                  <div key={type}>
                    <p className="font-medium">
                      {STEP_TYPE_ICONS[type]} {STEP_TYPE_HELP[type].title}
                    </p>
                    <p>{STEP_TYPE_HELP[type].example}</p>
                  </div>
                ))}
              </div>
            }
          >
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Ajuda sobre os tipos de etapa"
            >
              <CircleHelp className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(step.id)}
          className="text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Remover etapa"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-5 px-5 py-5">
        {/* ── Rules per type ── */}
        {step.stepType === "choice" && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground">
              <Checkbox
                checked={step.isRequired}
                onCheckedChange={(checked) =>
                  onUpdate(step.id, { isRequired: !!checked })
                }
              />
              Obrigatório
            </label>
            <span className="text-xs text-muted-foreground ml-auto bg-secondary px-2 py-0.5 rounded-full">
              Sempre 1 opção
            </span>
          </div>
        )}

        {step.stepType === "multi" && (
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <Checkbox
                checked={step.isRequired}
                onCheckedChange={(checked) =>
                  onUpdate(step.id, { isRequired: !!checked })
                }
              />
              Obrigatório
            </label>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Mínimo de opções
                </span>
                <Input
                  type="number"
                  min="0"
                  value={step.minSelections}
                  onChange={(e) =>
                    onUpdate(step.id, {
                      minSelections: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20 h-8 text-sm text-center"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Máximo de opções
                </span>
                <Input
                  type="number"
                  min="1"
                  value={step.maxSelections ?? ""}
                  onChange={(e) =>
                    onUpdate(step.id, {
                      maxSelections: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="∞"
                  className="w-20 h-8 text-sm text-center"
                />
              </div>
            </div>
          </div>
        )}

        {step.stepType === "composition" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Quantos sabores o cliente pode escolher?
              </label>
              <Input
                type="number"
                min="2"
                value={step.compositionConfig?.maxParts ?? 2}
                onChange={(e) =>
                  onUpdate(step.id, {
                    compositionConfig: {
                      maxParts: parseInt(e.target.value) || 2,
                    },
                  })
                }
                className="w-24 h-9"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Como calcular o preço?
              </label>
              <div className="flex flex-col gap-2">
                {(
                  [
                    { value: "max", label: "Cobrar o mais caro" },
                    { value: "average", label: "Média dos itens" },
                  ] as { value: PricingStrategy; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 cursor-pointer text-sm select-none"
                  >
                    <input
                      type="radio"
                      name={`pricing-${step.id}`}
                      value={opt.value}
                      checked={pricing === opt.value}
                      onChange={() =>
                        onUpdate(step.id, { pricingStrategy: opt.value })
                      }
                      className="accent-primary"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step.stepType === "quantity" && (
          <p className="text-xs text-muted-foreground">
            Configure preço e limites de quantidade individualmente em cada
            opção abaixo.
          </p>
        )}

        {/* ── Options list ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Opções
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddOption(step.id)}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar opção
            </Button>
          </div>

          {step.options.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-2 text-center">
              Nenhuma opção ainda. Clique em "Adicionar opção" para começar.
            </p>
          )}

          <div className="flex flex-col gap-2">
            {step.options.map((opt) => (
              <OptionItem
                key={opt.id}
                option={opt}
                stepType={step.stepType}
                allItems={allItems}
                onChange={(id, patch) => onUpdateOption(step.id, id, patch)}
                onRemove={(id) => onRemoveOption(step.id, id)}
                onAddChild={(parentId) => onAddChildOption(step.id, parentId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
