import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MesaQuickActions } from "@/features/tables/components/MesaQuickActions";
import type { Mesa } from "@/features/tables/model";

const mesa: Mesa = {
  id: "3",
  restaurantId: "rest-1",
  locationId: "loc-1",
  label: "Balcão 03",
  nome: "Balcão 03",
  qrCodeToken: "token-3",
  capacity: 2,
  capacidade: 2,
  isActive: true,
  status: "livre",
  pessoasConectadas: 0,
  filialId: "loc-1",
  sessionId: null,
};

const meta: Meta<typeof MesaQuickActions> = {
  title: "Tables/MesaQuickActions",
  component: MesaQuickActions,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MesaQuickActions>;

export const Default: Story = {
  args: {
    mesa,
    onToggleOccupancy: () => undefined,
    onOpenQr: () => undefined,
    onConnect: () => undefined,
    onViewOrder: () => undefined,
    onMore: () => undefined,
  },
};

export const Compact: Story = {
  args: {
    mesa,
    compact: true,
    onToggleOccupancy: () => undefined,
    onOpenQr: () => undefined,
    onConnect: () => undefined,
    onViewOrder: () => undefined,
    onMore: () => undefined,
  },
};
