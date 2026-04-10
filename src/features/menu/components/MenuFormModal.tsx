"use client";

import * as React from "react";
import { useFormik, FormikProvider } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";
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
import { LocationPicker } from "@/features/restaurants/components/LocationPicker";
import { menuFormSchema, type MenuFormValues } from "../schemas";

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
  onSubmit: (values: MenuEditValues) => Promise<void>;
}

type MenuFormModalProps = (CreateProps | EditProps) & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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
    initialValues: { name: "", locationId: "" },
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
