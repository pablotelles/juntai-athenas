import * as React from "react";
import { useField, useFormikContext } from "formik";
import { Label } from "@/components/primitives/label/Label";
import { cn } from "@/lib/cn";

// ─── FormError ────────────────────────────────────────────────────────────────

export function FormError({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p className={cn("text-xs text-destructive", className)} role="alert">
      {children}
    </p>
  );
}

// ─── FormControl ─────────────────────────────────────────────────────────────
// Generic slot — just renders children with an id anchor

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ─── FormField ────────────────────────────────────────────────────────────────
// Connects a named field to Formik context via useField.
// Passes field props + meta to the render child.

export interface FormFieldRenderProps {
  field: {
    name: string;
    value: unknown;
    onChange: (e: React.ChangeEvent<unknown>) => void;
    onBlur: (e: React.FocusEvent<unknown>) => void;
  };
  meta: {
    touched: boolean;
    error?: string;
  };
  hasError: boolean;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  className?: string;
  children: (renderProps: FormFieldRenderProps) => React.ReactNode;
}

export function FormField({
  name,
  label,
  required,
  className,
  children,
}: FormFieldProps) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}
      <FormControl>{children({ field, meta, hasError })}</FormControl>
      <FormError>{hasError ? meta.error : undefined}</FormError>
    </div>
  );
}

// ─── FormSubmitButton ─────────────────────────────────────────────────────────
// Reads Formik's isSubmitting automatically — no prop threading needed.

import {
  Button,
  type ButtonProps,
} from "@/components/primitives/button/Button";

export function FormSubmitButton({
  children = "Salvar",
  ...props
}: Omit<ButtonProps, "type" | "loading">) {
  const { isSubmitting } = useFormikContext();
  return (
    <Button type="submit" loading={isSubmitting} {...props}>
      {children}
    </Button>
  );
}
