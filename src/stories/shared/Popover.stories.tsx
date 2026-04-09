"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/shared/popover/Popover";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";

const meta: Meta = {
  title: "Shared/Popover",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center p-16">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Abrir popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4">
          <Text variant="h4" className="mb-1">Título do popover</Text>
          <Text variant="sm" muted>
            Conteúdo explicativo. Pode conter qualquer elemento React.
          </Text>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="flex items-center justify-center p-16">
      <Popover>
        <PopoverTrigger asChild>
          <Button>Confirmar ação</Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4">
          <Text variant="body" className="mb-3">
            Tem certeza que deseja continuar?
          </Text>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm">Cancelar</Button>
            <Button variant="destructive" size="sm">Confirmar</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
