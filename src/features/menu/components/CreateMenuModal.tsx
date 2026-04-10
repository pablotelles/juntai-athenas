"use client";

import * as React from "react";
import { useFormik, FormikProvider } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
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

interface CreateMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  onSubmit: (values: MenuFormValues) => Promise<void>;
}

export function CreateMenuModal({
  open,
  onOpenChange,
  restaurantId,
  onSubmit,
}: CreateMenuModalProps) {
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
