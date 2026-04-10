"use client";

import * as React from "react";
import { useFormik } from "formik";
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

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

export function CreateCategoryModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateCategoryModalProps) {
  const formik = useFormik<CategoryFormValues>({
    initialValues: { name: "" },
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
          <ModalTitle>Nova categoria</ModalTitle>
        </ModalHeader>

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
            <FormSubmitButton>Criar categoria</FormSubmitButton>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
