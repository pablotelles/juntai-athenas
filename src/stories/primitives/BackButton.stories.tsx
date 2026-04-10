import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BackButton } from "@/components/primitives/back-button/BackButton";

const meta: Meta<typeof BackButton> = {
  title: "Primitives/BackButton",
  component: BackButton,
  tags: ["autodocs"],
  argTypes: {
    href: { control: "text" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof BackButton>;

export const IconOnly: Story = {
  args: { href: "/" },
};

export const WithLabel: Story = {
  args: { href: "/", label: "Voltar" },
};

export const CustomLabel: Story = {
  args: { href: "/menu", label: "Cardápio" },
};

export const InPageHeader: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start gap-3">
        <BackButton href="/menu" className="mt-1" />
        <div>
          <p className="text-2xl font-semibold">Categorias</p>
          <p className="text-sm text-muted-foreground mt-1">
            Organize as categorias e arraste para reordenar.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <BackButton href="/menu/uuid" label="Pizzas" className="mt-1" />
        <div>
          <p className="text-2xl font-semibold">Produtos</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crie e gerencie os produtos desta categoria.
          </p>
        </div>
      </div>
    </div>
  ),
};
