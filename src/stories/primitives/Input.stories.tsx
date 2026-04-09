import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "@/components/primitives/input/Input";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    type: { control: "select", options: ["text", "email", "password", "number"] },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Digite algo..." },
};

export const WithError: Story = {
  args: { placeholder: "Email inválido", error: true, defaultValue: "nao@email" },
};

export const Disabled: Story = {
  args: { placeholder: "Desabilitado", disabled: true },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Senha" },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <Input type="text" placeholder="Texto" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Senha" />
      <Input type="number" placeholder="Número" />
      <Input type="text" error placeholder="Com erro" defaultValue="valor inválido" />
      <Input type="text" disabled placeholder="Desabilitado" />
    </div>
  ),
};
