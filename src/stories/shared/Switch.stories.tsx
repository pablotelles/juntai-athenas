"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Switch } from "@/components/shared/switch/Switch";
import { Label } from "@/components/primitives/label/Label";

const meta: Meta<typeof Switch> = {
  title: "Shared/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="sw1" />
      <Label htmlFor="sw1">Notificações</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="sw2" defaultChecked />
      <Label htmlFor="sw2">Ativado</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Switch id="sw3" disabled />
        <Label htmlFor="sw3" className="opacity-50">Desabilitado</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="sw4" disabled defaultChecked />
        <Label htmlFor="sw4" className="opacity-50">Desabilitado ativo</Label>
      </div>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex items-start gap-3">
      <Switch id="sw5" defaultChecked className="mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor="sw5">Modo escuro</Label>
        <span className="text-xs text-muted-foreground">
          Alterna entre tema claro e escuro
        </span>
      </div>
    </div>
  ),
};
