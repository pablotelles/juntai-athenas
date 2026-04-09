"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { Combobox } from "@/components/shared/combobox/Combobox";
import type { ComboboxOption } from "@/components/shared/combobox/Combobox";
import { Badge } from "@/components/primitives/badge/Badge";
import { Check } from "lucide-react";

const meta: Meta<typeof Combobox> = {
  title: "Shared/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Combobox>;

// ─── Mock data ───────────────────────────────────────────────

const statusOptions: ComboboxOption[] = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "pending", label: "Pendente" },
  { value: "suspended", label: "Suspenso", disabled: true },
];

const userOptions: ComboboxOption[] = [
  {
    value: "u1",
    label: "Ana Lima",
    description: "ana@juntai.com · Admin",
    image: "https://i.pravatar.cc/150?img=1",
  },
  {
    value: "u2",
    label: "Carlos Souza",
    description: "carlos@juntai.com · Operador",
    image: "https://i.pravatar.cc/150?img=3",
  },
  {
    value: "u3",
    label: "Beatriz Costa",
    description: "bea@juntai.com · Financeiro",
    image: "https://i.pravatar.cc/150?img=5",
  },
  {
    value: "u4",
    label: "Diego Alves",
    description: "diego@juntai.com · Suporte",
    image: "", // triggers initials fallback
  },
];

const restaurantOptions: ComboboxOption[] = [
  {
    value: "r1",
    label: "Cantina do Paulo",
    description: "Italiana · São Paulo, SP",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=64&h=64&fit=crop",
  },
  {
    value: "r2",
    label: "Burguer Factory",
    description: "Hambúrgueres · Rio de Janeiro, RJ",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=64&h=64&fit=crop",
  },
  {
    value: "r3",
    label: "Sushi Zen",
    description: "Japonesa · Curitiba, PR",
    image: "", // initials fallback
  },
  {
    value: "r4",
    label: "Pizzaria Bella",
    description: "Italiana · Belo Horizonte, MG",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=64&h=64&fit=crop",
  },
];

const menuOptions: ComboboxOption[] = [
  {
    value: "m1",
    label: "Pizza Margherita",
    description: "R$ 49,90 · Pizzas",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=64&h=64&fit=crop",
  },
  {
    value: "m2",
    label: "X-Burguer Clássico",
    description: "R$ 32,00 · Lanches",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=64&h=64&fit=crop",
  },
  {
    value: "m3",
    label: "Temaki Salmão",
    description: "R$ 28,50 · Japonesa",
    image: "",
  },
];

// ─── Stories ─────────────────────────────────────────────────

/** Opções simples sem imagem — funciona como um select com busca */
export const Simple: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <Combobox
        options={statusOptions}
        value={value}
        onChange={setValue}
        placeholder="Selecione um status"
      />
    );
  },
};

/** Seleção de usuários com avatar, nome e e-mail */
export const Users: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <Combobox
        options={userOptions}
        value={value}
        onChange={setValue}
        placeholder="Selecione um usuário"
        searchPlaceholder="Buscar por nome ou e-mail..."
      />
    );
  },
};

/** Seleção de restaurantes com imagem e localização */
export const Restaurants: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("r1");
    return (
      <Combobox
        options={restaurantOptions}
        value={value}
        onChange={setValue}
        placeholder="Selecione um restaurante"
      />
    );
  },
};

/** Itens do cardápio com preço e categoria */
export const MenuItems: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <Combobox
        options={menuOptions}
        value={value}
        onChange={setValue}
        placeholder="Selecione um item do cardápio"
      />
    );
  },
};

/** Estado de carregamento — esqueleto na lista e spinner no trigger */
export const Loading: Story = {
  render: function Render() {
    const [loading, setLoading] = React.useState(true);
    const [value, setValue] = React.useState("");

    return (
      <div className="flex flex-col gap-3">
        <Combobox
          options={loading ? [] : userOptions}
          value={value}
          onChange={setValue}
          loading={loading}
          placeholder="Carregando usuários..."
        />
        <button
          type="button"
          onClick={() => setLoading((v) => !v)}
          className="text-xs text-muted-foreground underline"
        >
          {loading ? "Simular dados carregados" : "Voltar a carregar"}
        </button>
      </div>
    );
  },
};

/** Busca server-side — onSearch dispara callback e o caller controla options + loading */
export const ServerSideSearch: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [results, setResults] = React.useState<ComboboxOption[]>(userOptions);

    function handleSearch(query: string) {
      setLoading(true);
      // Simulates a debounced BE call
      setTimeout(() => {
        setResults(
          query
            ? userOptions.filter((o) =>
                o.label.toLowerCase().includes(query.toLowerCase()),
              )
            : userOptions,
        );
        setLoading(false);
      }, 600);
    }

    return (
      <Combobox
        options={results}
        value={value}
        onChange={setValue}
        loading={loading}
        onSearch={handleSearch}
        placeholder="Selecione um usuário"
        searchPlaceholder="Digite para buscar..."
        emptyMessage="Nenhum usuário encontrado."
      />
    );
  },
};

/** Estado de erro — borda vermelha */
export const WithError: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <Combobox
        options={userOptions}
        value={value}
        onChange={setValue}
        placeholder="Selecione um usuário"
        error
      />
    );
  },
};

/** Desabilitado */
export const Disabled: Story = {
  render: () => (
    <Combobox
      options={userOptions}
      value="u2"
      placeholder="Desabilitado"
      disabled
    />
  ),
};

/** Render custom — badge de status ao lado do nome */
export const CustomRenderer: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <Combobox
        options={statusOptions}
        value={value}
        onChange={setValue}
        placeholder="Selecione um status"
        searchable={false}
        renderOption={(option, isSelected) => (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  option.value === "active"
                    ? "success"
                    : option.value === "inactive"
                      ? "secondary"
                      : option.value === "pending"
                        ? "warning"
                        : "destructive"
                }
                dot
              >
                {option.label}
              </Badge>
            </div>
            {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
          </div>
        )}
        renderSelected={(option) => (
          <Badge
            variant={
              option.value === "active"
                ? "success"
                : option.value === "inactive"
                  ? "secondary"
                  : option.value === "pending"
                    ? "warning"
                    : "destructive"
            }
            dot
          >
            {option.label}
          </Badge>
        )}
      />
    );
  },
};
