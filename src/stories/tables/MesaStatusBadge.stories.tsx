import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MesaStatusBadge } from "@/features/tables/components/MesaStatusBadge";

const meta: Meta<typeof MesaStatusBadge> = {
  title: "Tables/MesaStatusBadge",
  component: MesaStatusBadge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MesaStatusBadge>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <MesaStatusBadge status="livre" />
      <MesaStatusBadge status="ocupada" />
      <MesaStatusBadge status="reservada" />
      <MesaStatusBadge status="inativa" />
    </div>
  ),
};
