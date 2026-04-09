"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Checkbox } from "@/components/shared/checkbox/Checkbox";
import { Label } from "@/components/primitives/label/Label";

const meta: Meta<typeof Checkbox> = {
  title: "Shared/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="demo" />
      <Label htmlFor="demo">Aceitar termos de uso</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">Já aceito</Label>
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="indeterminate" checked="indeterminate" />
      <Label htmlFor="indeterminate">Seleção parcial</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="dis1" disabled />
        <Label htmlFor="dis1" className="opacity-50">
          Desabilitado
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="dis2" disabled defaultChecked />
        <Label htmlFor="dis2" className="opacity-50">
          Desabilitado marcado
        </Label>
      </div>
    </div>
  ),
};
