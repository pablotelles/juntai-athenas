import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "@/components/primitives/label/Label";
import { Input } from "@/components/primitives/input/Input";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => <Label>Nome do restaurante</Label>,
};

export const Required: Story = {
  render: () => <Label required>E-mail</Label>,
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5 w-64">
      <Label htmlFor="name" required>
        Nome
      </Label>
      <Input id="name" placeholder="Digite seu nome" />
    </div>
  ),
};
