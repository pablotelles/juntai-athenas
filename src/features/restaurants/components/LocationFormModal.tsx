"use client";

import { useFormik, FormikProvider } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/shared/modal/Modal";
import { FormField, FormSubmitButton } from "@/components/shared/form-field/FormField";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import type { Restaurant } from "@/features/restaurants/types";
import { locationFormSchema, type LocationFormValues } from "../schemas";

interface LocationFormModalProps {
  open: boolean;
  restaurant: Restaurant | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LocationFormValues) => Promise<void>;
}

const EMPTY_LOCATION: LocationFormValues = {
  name: "",
  phone: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
  country: "BR",
};

export function LocationFormModal({
  open,
  restaurant,
  onOpenChange,
  onSubmit,
}: LocationFormModalProps) {
  const formik = useFormik<LocationFormValues>({
    initialValues: EMPTY_LOCATION,
    validationSchema: toFormikValidationSchema(locationFormSchema),
    onSubmit: async (values, helpers) => {
      await onSubmit({
        ...values,
        state: values.state.toUpperCase(),
        postalCode: values.postalCode.replace(/\D/g, "").slice(0, 8),
        country: (values.country || "BR").toUpperCase(),
      });
      helpers.resetForm();
      onOpenChange(false);
    },
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Nova filial</ModalTitle>
          <ModalDescription>
            {restaurant
              ? `Cadastre uma nova unidade para ${restaurant.name}.`
              : "Cadastre uma nova unidade para o restaurante selecionado."}
          </ModalDescription>
        </ModalHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                name="name"
                label="Nome da filial"
                required
                className="sm:col-span-2"
              >
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="Ex.: Unidade Paulista"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField name="phone" label="Telefone">
                {({ field }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="(11) 99999-9999"
                  />
                )}
              </FormField>

              <FormField name="postalCode" label="CEP" required>
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="01310-100"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField
                name="street"
                label="Rua"
                required
                className="sm:col-span-2"
              >
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="Av. Paulista"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField name="number" label="Número" required>
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="1000"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField name="complement" label="Complemento">
                {({ field }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="Loja 2, térreo…"
                  />
                )}
              </FormField>

              <FormField name="neighborhood" label="Bairro" required>
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="Bela Vista"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField name="city" label="Cidade" required>
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="São Paulo"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField name="state" label="UF" required>
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="SP"
                    maxLength={2}
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField name="country" label="País">
                {({ field }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="BR"
                    maxLength={2}
                  />
                )}
              </FormField>
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <FormSubmitButton>Criar filial</FormSubmitButton>
            </ModalFooter>
          </form>
        </FormikProvider>
      </ModalContent>
    </Modal>
  );
}
