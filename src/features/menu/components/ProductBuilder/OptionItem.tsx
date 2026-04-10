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

  return (
    <div className={cn("flex flex-col gap-2", isChild && "ml-6 pl-3 border-l border-border")}>
      <div className="flex items-center gap-2">
        {/* Name */}
        <Input
          value={option.name}
          onChange={(e) => onChange(option.id, "name", e.target.value)}
          placeholder="Nome da opção"
          className="flex-1"
        />

        {/* Price delta — shown unless quantity step */}
        {!isQuantity && (
          <Input
            type="number"
            step="0.01"
            value={option.priceDelta || ""}
            onChange={(e) =>
              onChange(option.id, "priceDelta", parseFloat(e.target.value) || 0)
            }
            placeholder="+R$"
            className="w-24"
            aria-label="Acréscimo de preço"
          />
        )}

        {/* Add sub-option (only composition, non-child) */}
        {stepType === "composition" && !isChild && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAddChild(option.id)}
            aria-label="Adicionar sub-opção"
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
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Quantity step extra fields */}
      {isQuantity && (
        <div className="flex items-center gap-2 pl-1">
          <Input
            type="number"
            step="0.01"
            value={option.unitPrice ?? ""}
            onChange={(e) =>
              onChange(option.id, "unitPrice", parseFloat(e.target.value) || null)
            }
            placeholder="Preço/un."
            className="w-28"
          />
          <Input
            type="number"
            min="0"
            value={option.minQuantity}
            onChange={(e) =>
              onChange(option.id, "minQuantity", parseInt(e.target.value) || 0)
            }
            placeholder="Mín."
            className="w-20"
            aria-label="Quantidade mínima"
          />
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
            placeholder="Máx."
            className="w-20"
            aria-label="Quantidade máxima"
          />
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
