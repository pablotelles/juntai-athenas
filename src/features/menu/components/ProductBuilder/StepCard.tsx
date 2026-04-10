"use client";

import * as React from "react";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/shared/card/Card";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import { Checkbox } from "@/components/shared/checkbox/Checkbox";
import { Text } from "@/components/primitives/text/Text";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shared/select/Select";
import { OptionItem } from "./OptionItem";
import { STEP_TYPE_LABELS, emptyOption, type BuilderStep, type BuilderOption } from "../../builder";
import type { StepType } from "@juntai/types";

const STEP_TYPES: StepType[] = ["choice", "multi", "composition", "quantity"];

interface StepCardProps {
  step: BuilderStep;
  onUpdate: (stepId: string, patch: Partial<BuilderStep>) => void;
  onRemove: (stepId: string) => void;
  onAddOption: (stepId: string) => void;
  onUpdateOption: (stepId: string, optId: string, field: keyof BuilderOption, value: unknown) => void;
  onRemoveOption: (stepId: string, optId: string) => void;
  onAddChildOption: (stepId: string, parentId: string) => void;
}

export function StepCard({
  step,
  onUpdate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onAddChildOption,
}: StepCardProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const handleStepTypeChange = (value: string) => {
    const stepType = value as StepType;
    onUpdate(step.id, {
      stepType,
      // Reset composition config when changing away from composition
      compositionConfig: stepType === "composition" ? (step.compositionConfig ?? { maxParts: 2 }) : null,
    });
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-3">
          {/* Step name */}
          <Input
            value={step.name}
            onChange={(e) => onUpdate(step.id, { name: e.target.value })}
            placeholder="Nome da etapa (ex: Escolha o tamanho)"
            className="flex-1"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(step.id)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remover etapa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          {/* Type + required */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={step.stepType} onValueChange={handleStepTypeChange}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEP_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {STEP_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={step.isRequired}
                onCheckedChange={(checked) =>
                  onUpdate(step.id, { isRequired: !!checked })
                }
              />
              <Text variant="sm">Obrigatório</Text>
            </label>
          </div>

          {/* min / max */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Text variant="xs" muted>
                Mín.
              </Text>
              <Input
                type="number"
                min="0"
                value={step.minSelections}
                onChange={(e) =>
                  onUpdate(step.id, { minSelections: parseInt(e.target.value) || 0 })
                }
                className="w-16 text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <Text variant="xs" muted>
                Máx.
              </Text>
              <Input
                type="number"
                min="1"
                value={step.maxSelections ?? ""}
                onChange={(e) =>
                  onUpdate(step.id, {
                    maxSelections: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-16 text-center"
                placeholder="∞"
              />
            </div>
          </div>

          {/* Composition: number of parts */}
          {step.stepType === "composition" && (
            <div className="flex items-center gap-2">
              <Text variant="sm">Número de partes:</Text>
              <Input
                type="number"
                min="2"
                value={step.compositionConfig?.maxParts ?? 2}
                onChange={(e) =>
                  onUpdate(step.id, {
                    compositionConfig: { maxParts: parseInt(e.target.value) || 2 },
                  })
                }
                className="w-20"
              />
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Text variant="xs" muted>
                Opções
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onAddOption(step.id)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Adicionar opção
              </Button>
            </div>

            {step.options.length === 0 && (
              <Text variant="xs" muted className="italic">
                Nenhuma opção adicionada.
              </Text>
            )}

            {step.options.map((opt) => (
              <OptionItem
                key={opt.id}
                option={opt}
                stepType={step.stepType}
                onChange={(id, field, value) =>
                  onUpdateOption(step.id, id, field, value)
                }
                onRemove={(id) => onRemoveOption(step.id, id)}
                onAddChild={(parentId) => onAddChildOption(step.id, parentId)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
