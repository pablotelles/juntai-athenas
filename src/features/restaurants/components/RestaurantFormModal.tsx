"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/select/Select";
import { FormField, FormSubmitButton } from "@/components/shared/form-field/FormField";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import { useUsers } from "@/features/users/hooks";
import { slugify } from "@/lib/slugify";
import { restaurantFormSchema, type RestaurantFormValues } from "../schemas";

interface RestaurantFormModalProps {
  open: boolean;
  canChooseOwner: boolean;
  currentUser: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RestaurantFormValues) => Promise<void>;
}

export function RestaurantFormModal({
  open,
  canChooseOwner,
  currentUser,
  onOpenChange,
  onSubmit,
}: RestaurantFormModalProps) {
  const [ownerSearch, setOwnerSearch] = React.useState("");
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = React.useState("");
  const slugManuallyEdited = React.useRef(false);

  const { data: usersPage, isLoading: isUsersLoading } = useUsers(
    canChooseOwner
      ? {
          name: debouncedOwnerSearch || undefined,
          email: debouncedOwnerSearch || undefined,
          page: 1,
          limit: 20,
        }
      : { page: 1, limit: 20 },
  );

  const formik = useFormik<RestaurantFormValues>({
    initialValues: {
      name: "",
      slug: "",
      ownerUserId: currentUser?.id ?? "",
    },
    enableReinitialize: true,
    validationSchema: toFormikValidationSchema(restaurantFormSchema),
    onSubmit: async (values, helpers) => {
      await onSubmit({ ...values, slug: slugify(values.slug) });
      helpers.resetForm();
      slugManuallyEdited.current = false;
      onOpenChange(false);
    },
  });

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedOwnerSearch(ownerSearch.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [ownerSearch]);

  React.useEffect(() => {
    if (!open) {
      formik.resetForm();
      setOwnerSearch("");
      setDebouncedOwnerSearch("");
      slugManuallyEdited.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const ownerOptions = React.useMemo(() => {
    const map = new Map<
      string,
      { id: string; label: string; description: string }
    >();

    if (currentUser?.id) {
      map.set(currentUser.id, {
        id: currentUser.id,
        label: currentUser.name?.trim() || currentUser.email || "Eu",
        description: currentUser.email ?? "Usuário atual",
      });
    }

    for (const item of usersPage?.data ?? []) {
      if (item.type !== "user") continue;
      map.set(item.id, {
        id: item.id,
        label: item.name?.trim() || item.email || item.id,
        description: item.email ?? item.id,
      });
    }

    return Array.from(map.values());
  }, [currentUser, usersPage?.data]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>Novo restaurante</ModalTitle>
          <ModalDescription>
            Cadastre uma nova operação principal e defina quem será o owner
            responsável desde a criação.
          </ModalDescription>
        </ModalHeader>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            <FormField name="name" label="Nome do restaurante" required>
              {({ field, hasError }) => (
                <Input
                  {...field}
                  value={field.value as string}
                  placeholder="Ex.: Juntai Centro"
                  aria-invalid={hasError}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!slugManuallyEdited.current) {
                      void formik.setFieldValue("slug", slugify(e.target.value));
                    }
                  }}
                />
              )}
            </FormField>

            <FormField name="slug" label="Slug" required>
              {({ field, hasError }) => (
                <>
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="juntai-centro"
                    aria-invalid={hasError}
                    onChange={(e) => {
                      slugManuallyEdited.current = true;
                      field.onChange(e);
                    }}
                  />
                  <Text variant="xs" muted className="block">
                    Use apenas letras minúsculas, números e hífens.
                  </Text>
                </>
              )}
            </FormField>

            {canChooseOwner ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Proprietário responsável <span className="text-destructive">*</span>
                </label>
                <Input
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  placeholder="Pesquisar usuário por nome ou e-mail"
                />
                <Select
                  value={formik.values.ownerUserId}
                  onValueChange={(value) =>
                    formik.setFieldValue("ownerUserId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isUsersLoading
                          ? "Carregando usuários…"
                          : "Selecione quem será o owner"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label} — {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Text variant="xs" muted className="block">
                  Você pode escolher se o restaurante pertence a você ou a outro
                  usuário.
                </Text>
                {formik.touched.ownerUserId && formik.errors.ownerUserId ? (
                  <p className="text-xs text-destructive" role="alert">
                    {formik.errors.ownerUserId}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <Text variant="sm" className="font-medium text-foreground">
                  Este restaurante será vinculado automaticamente a você.
                </Text>
                <Text variant="xs" muted className="mt-1 block">
                  {currentUser?.email ?? currentUser?.name ?? "Owner atual"}
                </Text>
              </div>
            )}

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <FormSubmitButton>Criar restaurante</FormSubmitButton>
            </ModalFooter>
          </form>
        </FormikProvider>
      </ModalContent>
    </Modal>
  );
}
