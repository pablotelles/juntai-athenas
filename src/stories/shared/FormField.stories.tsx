"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Formik, Form } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";
import {
  FormField,
  FormSubmitButton,
} from "@/components/shared/form-field/FormField";
import { Input } from "@/components/primitives/input/Input";

const meta: Meta = {
  title: "Shared/FormField",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
});

export const Default: Story = {
  render: () => (
    <Formik
      initialValues={{ name: "", email: "" }}
      validationSchema={toFormikValidationSchema(schema)}
      onSubmit={(values) => alert(JSON.stringify(values, null, 2))}
    >
      {() => (
        <Form className="flex flex-col gap-4 w-80">
          <FormField name="name" label="Nome" required>
            {({ field, hasError }) => (
              <Input
                {...field}
                value={String(field.value)}
                error={hasError}
                placeholder="Seu nome"
              />
            )}
          </FormField>
          <FormField name="email" label="Email" required>
            {({ field, hasError }) => (
              <Input
                {...field}
                value={String(field.value)}
                type="email"
                error={hasError}
                placeholder="seu@email.com"
              />
            )}
          </FormField>
          <FormSubmitButton>Enviar</FormSubmitButton>
        </Form>
      )}
    </Formik>
  ),
};

export const WithInitialErrors: Story = {
  render: () => (
    <Formik
      initialValues={{ name: "", email: "invalido" }}
      initialTouched={{ name: true, email: true }}
      initialErrors={{ name: "Nome obrigatório", email: "Email inválido" }}
      validationSchema={toFormikValidationSchema(schema)}
      onSubmit={() => {}}
    >
      {() => (
        <Form className="flex flex-col gap-4 w-80">
          <FormField name="name" label="Nome" required>
            {({ field, hasError }) => (
              <Input
                {...field}
                value={String(field.value)}
                error={hasError}
                placeholder="Seu nome"
              />
            )}
          </FormField>
          <FormField name="email" label="Email" required>
            {({ field, hasError }) => (
              <Input
                {...field}
                value={String(field.value)}
                type="email"
                error={hasError}
                placeholder="seu@email.com"
              />
            )}
          </FormField>
          <FormSubmitButton>Enviar</FormSubmitButton>
        </Form>
      )}
    </Formik>
  ),
};
