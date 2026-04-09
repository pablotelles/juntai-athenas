"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/shared/select/Select";

const meta: Meta = {
  title: "Shared/Select",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="w-56">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="inactive">Inativo</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Frutas</SelectLabel>
            <SelectItem value="apple">Maçã</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="mango">Manga</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Legumes</SelectLabel>
            <SelectItem value="carrot">Cenoura</SelectItem>
            <SelectItem value="pepper">Pimentão</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-56">
      <Select>
        <SelectTrigger error>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opção A</SelectItem>
          <SelectItem value="b">Opção B</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-56">
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Desabilitado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opção A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="w-56">
      <Select disabled>
        <SelectTrigger loading>
          <SelectValue placeholder="Carregando opções..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opção A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
