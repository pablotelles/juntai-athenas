"use client";

import * as React from "react";
import { useFormik, FormikProvider } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";
import { LayoutList, Layers, Info } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/shared/modal/Modal";
import { FormField, FormSubmitButton } from "@/components/shared/form-field/FormField";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import { Badge } from "@/components/primitives/badge/Badge";
import { Tooltip } from "@/components/shared/tooltip/Tooltip";
import { LocationPicker } from "@/features/restaurants/components/LocationPicker";
import { menuFormSchema, type MenuFormValues } from "../schemas";
import { cn } from "@/lib/cn";
import type { MenuStyle } from "@juntai/types";

// Edit mode only requires a name change
const menuEditSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200, "Máximo 200 caracteres"),
});
type MenuEditValues = z.infer<typeof menuEditSchema>;

interface CreateProps {
  mode: "create";
  restaurantId: string;
  onSubmit: (values: MenuFormValues) => Promise<void>;
}

interface EditProps {
  mode: "edit";
  restaurantId?: never;
  initialName: string;
  initialStyle?: MenuStyle;
  onSubmit: (values: MenuEditValues) => Promise<void>;
}

type MenuFormModalProps = (CreateProps | EditProps) & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Style options ────────────────────────────────────────────────────────────

const STYLE_OPTIONS: Array<{
  value: MenuStyle;
  label: string;
  icon: React.ElementType;
  description: string;
  tooltip: string;
}> = [
  {
    value: "flat",
    label: "Simples",
    icon: LayoutList,
    description: "Itens direto no menu, sem divisões internas.",
    tooltip:
      'Ideal para menus temáticos como "Pizzas" ou "Vinhos". Todos os itens ficam em uma única lista.',
  },
  {
    value: "categorized",
    label: "Com categorias",
    icon: Layers,
    description: "Organize os itens em seções como Entradas e Pratos.",
    tooltip:
      'Ideal para cardápios completos com múltiplas seções. Você poderá criar e reordenar categorias.',
  },
];

const STYLE_LABELS: Record<MenuStyle, string> = {
  flat: "Simples",
  categorized: "Com categorias",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MenuFormModal(props: MenuFormModalProps) {
  const { open, onOpenChange, mode } = props;

  if (mode === "create") {
    return <CreateMenuForm {...props} />;
  }
  return <EditMenuForm {...props} />;
}

function CreateMenuForm({
  open,
  onOpenChange,
  restaurantId,
  onSubmit,
}: CreateProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const formik = useFormik<MenuFormValues>({
    initialValues: { name: "", locationId: "", style: "categorized" },
    validationSchema: toFormikValidationSchema(menuFormSchema),
    onSubmit: async (values, helpers) => {
      await onSubmit(values);
      helpers.resetForm();
      onOpenChange(false);
    },
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Novo cardápio</ModalTitle>
          <ModalDescription>
            Crie um cardápio para uma filial do restaurante.
          </ModalDescription>
        </ModalHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            {/* Style selector */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Estilo do cardápio
                </span>
                <Tooltip
                  content="Define como os itens são organizados neste cardápio."
                  side="right"
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formik.values.style === option.value;
                  return (
                    <Tooltip key={option.value} content={option.tooltip} side="bottom">
                      <button
                        type="button"
                        onClick={() => formik.setFieldValue("style", option.value)}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-border-strong",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isSelected ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            isSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground leading-snug">
                          {option.description}
                        </span>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <FormField name="name" label="Nome do cardápio" required>
              {({ field, hasError }) => (
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Ex: Cardápio de Verão"
                  aria-invalid={hasError}
                />
              )}
            </FormField>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Filial <span className="text-destructive">*</span>
              </span>
              <LocationPicker
                restaurantId={restaurantId}
                value={formik.values.locationId || null}
                onChange={(id) => formik.setFieldValue("locationId", id)}
              />
              {formik.touched.locationId && formik.errors.locationId && (
                <p className="text-xs text-destructive" role="alert">
                  {formik.errors.locationId}
                </p>
              )}
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <FormSubmitButton>Criar cardápio</FormSubmitButton>
            </ModalFooter>
          </form>
        </FormikProvider>
      </ModalContent>
    </Modal>
  );
}

function EditMenuForm({
  open,
  onOpenChange,
  initialName,
  initialStyle,
  onSubmit,
}: EditProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const formik = useFormik<MenuEditValues>({
    initialValues: { name: initialName },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(menuEditSchema),
    onSubmit: async (values, helpers) => {
      await onSubmit(values);
      helpers.resetForm();
      onOpenChange(false);
    },
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Editar cardápio</ModalTitle>
        </ModalHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            {initialStyle && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estilo:</span>
                <Badge variant="secondary">{STYLE_LABELS[initialStyle]}</Badge>
                <Tooltip
                  content="O estilo não pode ser alterado após a criação do cardápio."
                  side="right"
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
            )}

            <FormField name="name" label="Nome do cardápio" required>
              {({ field, hasError }) => (
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Ex: Cardápio de Verão"
                  aria-invalid={hasError}
                  autoFocus
                />
              )}
            </FormField>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <FormSubmitButton>Salvar</FormSubmitButton>
            </ModalFooter>
          </form>
        </FormikProvider>
      </ModalContent>
    </Modal>
  );
}
