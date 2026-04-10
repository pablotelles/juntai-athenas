"use client";

import * as React from "react";
import { useFormik, FormikProvider } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/shared/modal/Modal";
import { FormField, FormSubmitButton } from "@/components/shared/form-field/FormField";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import { categoryFormSchema, type CategoryFormValues } from "../schemas";

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValues?: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  mode,
  initialValues,
  onSubmit,
}: CategoryFormModalProps) {
  const formik = useFormik<CategoryFormValues>({
    initialValues: initialValues ?? { name: "" },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(categoryFormSchema),
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
          <ModalTitle>
            {mode === "create" ? "Nova categoria" : "Editar categoria"}
          </ModalTitle>
        </ModalHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <FormField name="name" label="Nome da categoria" required>
              {({ field, hasError }) => (
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Ex: Entradas, Pratos Principais…"
                  aria-invalid={hasError}
                  autoFocus
                />
              )}
            </FormField>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <FormSubmitButton>
                {mode === "create" ? "Criar categoria" : "Salvar"}
              </FormSubmitButton>
            </ModalFooter>
          </form>
        </FormikProvider>
      </ModalContent>
    </Modal>
  );
}
