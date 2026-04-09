"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip } from "@/components/shared/tooltip/Tooltip";
import { Button } from "@/components/primitives/button/Button";
import { Info } from "lucide-react";

const meta: Meta = {
  title: "Shared/Tooltip",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center p-12">
      <Tooltip content="Informação adicional">
        <Button variant="outline">Passe o mouse aqui</Button>
      </Tooltip>
    </div>
  ),
};

export const Sides: Story = {
  render: () => (
    <div className="flex items-center justify-center gap-8 p-16">
      <Tooltip content="Acima" side="top">
        <Button variant="outline" size="sm">Top</Button>
      </Tooltip>
      <Tooltip content="Direita" side="right">
        <Button variant="outline" size="sm">Right</Button>
      </Tooltip>
      <Tooltip content="Abaixo" side="bottom">
        <Button variant="outline" size="sm">Bottom</Button>
      </Tooltip>
      <Tooltip content="Esquerda" side="left">
        <Button variant="outline" size="sm">Left</Button>
      </Tooltip>
    </div>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <div className="flex items-center justify-center p-12">
      <Tooltip content="Este campo é obrigatório para o cadastro">
        <Info size={16} className="text-muted-foreground cursor-help" />
      </Tooltip>
    </div>
  ),
};
