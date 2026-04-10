"use client";

import * as React from "react";
import { Plus, Wand2 } from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shared/dropdown-menu/DropdownMenu";
import { StepCard } from "./StepCard";
import { getProductTemplate, emptyStep, emptyOption, type BuilderStep, type BuilderOption } from "../../builder";

type TemplateType = "pizza" | "burger" | "poke";

const TEMPLATES: { value: TemplateType; label: string }[] = [
  { value: "pizza", label: "Pizza" },
  { value: "burger", label: "Hambúrguer" },
  { value: "poke", label: "Poke" },
];

interface StepsBuilderProps {
  steps: BuilderStep[];
  onStepsChange: (steps: BuilderStep[]) => void;
}

export function StepsBuilder({ steps, onStepsChange }: StepsBuilderProps) {
  const updateStep = (stepId: string, patch: Partial<BuilderStep>) => {
    onStepsChange(steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)));
  };

  const removeStep = (stepId: string) => {
    onStepsChange(steps.filter((s) => s.id !== stepId));
  };

  const addStep = () => {
    onStepsChange([...steps, emptyStep()]);
  };

  const addOption = (stepId: string) => {
    onStepsChange(
      steps.map((s) =>
        s.id === stepId ? { ...s, options: [...s.options, emptyOption()] } : s,
      ),
    );
  };

  // Recursively update option (handles child options too)
  const updateOptionInTree = (
    options: BuilderOption[],
    optId: string,
    field: keyof BuilderOption,
    value: unknown,
  ): BuilderOption[] =>
    options.map((opt) => {
      if (opt.id === optId) return { ...opt, [field]: value };
      if (opt.childOptions.length > 0)
        return { ...opt, childOptions: updateOptionInTree(opt.childOptions, optId, field, value) };
      return opt;
    });

  const removeOptionFromTree = (options: BuilderOption[], optId: string): BuilderOption[] =>
    options
      .filter((opt) => opt.id !== optId)
      .map((opt) => ({
        ...opt,
        childOptions: removeOptionFromTree(opt.childOptions, optId),
      }));

  const updateOption = (stepId: string, optId: string, field: keyof BuilderOption, value: unknown) => {
    onStepsChange(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, options: updateOptionInTree(s.options, optId, field, value) }
          : s,
      ),
    );
  };

  const removeOption = (stepId: string, optId: string) => {
    onStepsChange(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, options: removeOptionFromTree(s.options, optId) }
          : s,
      ),
    );
  };

  const addChildOption = (stepId: string, parentId: string) => {
    const child = { ...emptyOption(), parentOptionId: parentId };
    onStepsChange(
      steps.map((s) => {
        if (s.id !== stepId) return s;
        return {
          ...s,
          options: s.options.map((opt) =>
            opt.id === parentId
              ? { ...opt, childOptions: [...opt.childOptions, child] }
              : opt,
          ),
        };
      }),
    );
  };

  const applyTemplate = (type: TemplateType) => {
    onStepsChange(getProductTemplate(type));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text variant="sm" className="font-medium">
          Etapas de personalização
        </Text>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Wand2 className="h-3.5 w-3.5 mr-1" />
                Usar template
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {TEMPLATES.map((t) => (
                <DropdownMenuItem key={t.value} onClick={() => applyTemplate(t.value)}>
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" size="sm" onClick={addStep}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar etapa
          </Button>
        </div>
      </div>

      {steps.length === 0 && (
        <Text variant="sm" muted className="italic">
          Nenhuma etapa. Adicione etapas ou use um template.
        </Text>
      )}

      {steps.map((step) => (
        <StepCard
          key={step.id}
          step={step}
          onUpdate={updateStep}
          onRemove={removeStep}
          onAddOption={addOption}
          onUpdateOption={updateOption}
          onRemoveOption={removeOption}
          onAddChildOption={addChildOption}
        />
      ))}
    </div>
  );
}
