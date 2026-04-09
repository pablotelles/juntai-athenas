import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "@/components/compositions/header/Header";
import { Button } from "@/components/primitives/button/Button";
import { Badge } from "@/components/primitives/badge/Badge";
import { Plus, Download } from "lucide-react";

const meta: Meta<typeof Header> = {
  title: "Compositions/Header",
  component: Header,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    title: "Pedidos",
    description: "Gerencie os pedidos em tempo real",
  },
};

export const WithActions: Story = {
  args: {
    title: "Cardápio",
    description: "Gerencie os itens do seu cardápio",
    actions: (
      <>
        <Button variant="outline" size="sm">
          <Download size={14} className="mr-1" />
          Exportar
        </Button>
        <Button size="sm">
          <Plus size={14} className="mr-1" />
          Novo item
        </Button>
      </>
    ),
  },
};

export const WithBreadcrumb: Story = {
  args: {
    title: "Editar item",
    description: "Pizza Margherita",
    breadcrumb: (
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Cardápio</span>
        <span>/</span>
        <span className="text-foreground font-medium">Editar item</span>
      </nav>
    ),
    actions: <Button size="sm">Salvar alterações</Button>,
  },
};

export const WithBadge: Story = {
  render: () => (
    <div>
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-surface shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Pedidos{" "}
            <Badge variant="warning" dot>
              12 pendentes
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualizados em tempo real
          </p>
        </div>
        <Button size="sm">Ver todos</Button>
      </header>
    </div>
  ),
};
