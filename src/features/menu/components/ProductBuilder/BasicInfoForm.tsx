"use client";

import * as React from "react";
import { useFormikContext } from "formik";
import { ImageIcon, Package2, WalletCards } from "lucide-react";
import { Input } from "@/components/primitives/input/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/card/Card";
import { FormField } from "@/components/shared/form-field/FormField";
import type { ItemFormValues } from "../../schemas";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Must be rendered inside a <FormikProvider value={infoFormik}> ancestor.

export function BasicInfoForm() {
  const { values, setFieldValue } = useFormikContext<ItemFormValues>();
  const basePrice = values.basePrice || 0;
  const hasImage = Boolean(values.imageUrl?.trim());

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-4 w-4 text-primary" />
              Dados principais
            </CardTitle>
            <CardDescription variant="compact">
              Preencha as informações que ajudam o cliente a reconhecer este
              produto.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-col gap-3">
              <FormField name="name" label="Nome" required>
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="Ex: Pizza Margherita"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>

              <FormField name="description" label="Descrição">
                {({ field, hasError }) => (
                  <textarea
                    {...field}
                    value={field.value as string}
                    placeholder="Descreva o produto brevemente…"
                    rows={3}
                    aria-invalid={hasError}
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
                  />
                )}
              </FormField>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-primary" />
                Pricing
              </CardTitle>
              <CardDescription variant="compact">
                Defina o valor inicial exibido ao cliente.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <FormField name="basePrice" label="Preço base (R$)" required>
                {({ field, hasError }) => (
                  <Input
                    name="basePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={(field.value as number) || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "basePrice",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    onBlur={field.onBlur}
                    placeholder="0,00"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Media
              </CardTitle>
              <CardDescription variant="compact">
                Use uma imagem clara para valorizar o item no cardápio.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <FormField name="imageUrl" label="URL da imagem">
                {({ field, hasError }) => (
                  <Input
                    {...field}
                    value={field.value as string}
                    placeholder="https://…"
                    aria-invalid={hasError}
                  />
                )}
              </FormField>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader className="p-4 pb-2">
          <CardTitle>Prévia rápida</CardTitle>
          <CardDescription variant="compact">
            Veja como a ficha do produto começa a ganhar forma.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col gap-3">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.imageUrl}
                alt={values.name || "Prévia do produto"}
                className="aspect-[4/3] w-full rounded-xl object-cover border border-border bg-secondary"
              />
            ) : (
              <div className="aspect-[4/3] w-full rounded-xl border border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Sua imagem aparece aqui</p>
                <p className="text-xs">Adicione uma URL para visualizar</p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-base font-semibold leading-tight">
                {values.name?.trim() || "Nome do produto"}
              </p>
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                {values.description?.trim() ||
                  "Uma descrição curta ajuda o cliente a entender o diferencial do item."}
              </p>
              <p className="mt-3 text-lg font-bold text-primary">
                {basePrice > 0 ? formatPrice(basePrice) : "R$ 0,00"}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Boas práticas</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>Use um nome curto e fácil de bater o olho.</li>
                <li>Destaque o principal diferencial em uma frase.</li>
                <li>Prefira imagens claras, frontais e apetitosas.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
