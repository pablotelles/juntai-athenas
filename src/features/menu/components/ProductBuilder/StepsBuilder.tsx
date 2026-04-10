"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/primitives/button/Button";
import { StepCard } from "./StepCard";
import { ProductTemplateSelector } from "./ProductTemplateSelector";
import {
  emptyStep,
  emptyOption,
  type BuilderStep,
  type BuilderOption,
} from "../../builder";
import type { MenuItem } from "@juntai/types";

// ─── Sortable wrapper ─────────────────────────────────────────────────────────

function SortableStepCard({
  step,
  ...props
}: { step: BuilderStep } & Omit<
  React.ComponentProps<typeof StepCard>,
  "step" | "dragHandleProps"
>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <StepCard
        step={step}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...props}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function updateOptionInTree(
  options: BuilderOption[],
  optId: string,
  patch: Partial<BuilderOption>,
): BuilderOption[] {
  return options.map((opt) => {
    if (opt.id === optId) return { ...opt, ...patch };
    if (opt.childOptions.length > 0)
      return {
        ...opt,
        childOptions: updateOptionInTree(opt.childOptions, optId, patch),
      };
    return opt;
  });
}

function removeOptionFromTree(
  options: BuilderOption[],
  optId: string,
): BuilderOption[] {
  return options
    .filter((opt) => opt.id !== optId)
    .map((opt) => ({
      ...opt,
      childOptions: removeOptionFromTree(opt.childOptions, optId),
    }));
}

// ─── StepsBuilder ─────────────────────────────────────────────────────────────

interface StepsBuilderProps {
  steps: BuilderStep[];
  allItems: MenuItem[];
  catalogCategories: Array<{
    id: string;
    label: string;
    items: MenuItem[];
  }>;
  onStepsChange: (steps: BuilderStep[]) => void;
}

export function StepsBuilder({
  steps,
  allItems,
  catalogCategories,
  onStepsChange,
}: StepsBuilderProps) {
  const [templateSelected, setTemplateSelected] = React.useState(
    steps.length > 0,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = steps.findIndex((s) => s.id === active.id);
    const newIdx = steps.findIndex((s) => s.id === over.id);
    onStepsChange(arrayMove(steps, oldIdx, newIdx));
  };

  const updateStep = (stepId: string, patch: Partial<BuilderStep>) =>
    onStepsChange(steps.map((s) => (s.id === stepId ? { ...s, ...patch } : s)));

  const removeStep = (stepId: string) =>
    onStepsChange(steps.filter((s) => s.id !== stepId));

  const addStep = () => {
    setTemplateSelected(true);
    onStepsChange([...steps, emptyStep()]);
  };

  const addOption = (stepId: string) =>
    onStepsChange(
      steps.map((s) =>
        s.id === stepId ? { ...s, options: [...s.options, emptyOption()] } : s,
      ),
    );

  const importCategoryOptions = (stepId: string, categoryId: string) =>
    onStepsChange(
      steps.map((s) => {
        if (s.id !== stepId) return s;

        const category = catalogCategories.find((c) => c.id === categoryId);
        if (!category) return s;

        const existingLinkedIds = new Set(
          s.options
            .map((opt) => opt.linkedItemId)
            .filter((id): id is string => !!id),
        );

        const importedOptions = category.items
          .filter((item) => !existingLinkedIds.has(item.id))
          .map((item) => ({
            ...emptyOption(),
            linkedItemId: item.id,
            name: item.name,
            imageUrl: item.imageUrl ?? "",
            description: item.description ?? "",
            priceDelta: s.stepType === "quantity" ? 0 : item.basePrice,
            unitPrice: s.stepType === "quantity" ? item.basePrice : null,
          }));

        if (importedOptions.length === 0) return s;

        return {
          ...s,
          options: [...s.options, ...importedOptions],
        };
      }),
    );

  const updateOption = (
    stepId: string,
    optId: string,
    patch: Partial<BuilderOption>,
  ) =>
    onStepsChange(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, options: updateOptionInTree(s.options, optId, patch) }
          : s,
      ),
    );

  const removeOption = (stepId: string, optId: string) =>
    onStepsChange(
      steps.map((s) =>
        s.id === stepId
          ? { ...s, options: removeOptionFromTree(s.options, optId) }
          : s,
      ),
    );

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

  // Show template selector if user hasn't chosen yet
  if (!templateSelected) {
    return (
      <ProductTemplateSelector
        onSelect={(tplSteps) => {
          onStepsChange(tplSteps);
          setTemplateSelected(true);
        }}
        onSkip={() => setTemplateSelected(true)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <SortableStepCard
                key={step.id}
                step={step}
                allItems={allItems}
                catalogCategories={catalogCategories}
                onUpdate={updateStep}
                onRemove={removeStep}
                onAddOption={addOption}
                onImportCategory={importCategoryOptions}
                onUpdateOption={updateOption}
                onRemoveOption={removeOption}
                onAddChildOption={addChildOption}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        onClick={addStep}
        className="w-full border-dashed h-11 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Adicionar etapa
      </Button>
    </div>
  );
}
