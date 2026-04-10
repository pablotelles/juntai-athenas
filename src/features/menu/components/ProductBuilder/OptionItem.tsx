"use client";

import * as React from "react";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import { cn } from "@/lib/cn";
import type { BuilderOption } from "../../builder";
import type { StepType } from "@juntai/types";

interface OptionItemProps {
  option: BuilderOption;
  stepType: StepType;
  isChild?: boolean;
  onChange: (id: string, field: keyof BuilderOption, value: unknown) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function OptionItem({
  option,
  stepType,
  isChild = false,
  onChange,
  onRemove,
  onAddChild,
}: OptionItemProps) {
  const isQuantity = stepType === "quantity";
  const isComposition = stepType === "composition";

  return (
    <div className={cn("flex flex-col gap-2", isChild && "ml-5 pl-4 border-l-2 border-border")}>
      {/* Row: name + price (+ child btn + remove) */}
      <div className="flex items-center gap-2">
        <Input
          value={option.name}
          onChange={(e) => onChange(option.id, "name", e.target.value)}
          placeholder={isChild ? "Nome da sub-opção" : "Nome da opção"}
          className="flex-1 h-9 text-sm"
        />

        {!isQuantity && (
          <div className="relative w-28">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              +R$
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={option.priceDelta || ""}
              onChange={(e) =>
                onChange(option.id, "priceDelta", parseFloat(e.target.value) || 0)
              }
              placeholder="0,00"
              className="pl-9 h-9 text-sm"
              aria-label="Acréscimo de preço"
            />
          </div>
        )}

        {isComposition && !isChild && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAddChild(option.id)}
            aria-label="Adicionar sub-opção"
            title="Adicionar sub-opção"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(option.id)}
          aria-label="Remover opção"
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Quantity fields */}
      {isQuantity && (
        <div className="flex items-center gap-2 flex-wrap pl-0.5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Preço/unidade</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={option.unitPrice ?? ""}
              onChange={(e) =>
                onChange(option.id, "unitPrice", parseFloat(e.target.value) || null)
              }
              placeholder="R$ 0,00"
              className="w-28 h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Mínimo</span>
            <Input
              type="number"
              min="0"
              value={option.minQuantity}
              onChange={(e) =>
                onChange(option.id, "minQuantity", parseInt(e.target.value) || 0)
              }
              className="w-20 h-8 text-sm text-center"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Máximo</span>
            <Input
              type="number"
              min="1"
              value={option.maxQuantity ?? ""}
              onChange={(e) =>
                onChange(
                  option.id,
                  "maxQuantity",
                  e.target.value ? parseInt(e.target.value) : null,
                )
              }
              placeholder="∞"
              className="w-20 h-8 text-sm text-center"
            />
          </div>
        </div>
      )}

      {/* Child options */}
      {option.childOptions.map((child) => (
        <OptionItem
          key={child.id}
          option={child}
          stepType={stepType}
          isChild
          onChange={onChange}
          onRemove={onRemove}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}
