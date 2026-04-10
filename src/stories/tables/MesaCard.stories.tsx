import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MesaCard } from "@/features/tables/components/MesaCard";
import type { Mesa } from "@/features/tables/model";

const baseMesa: Mesa = {
  id: "mesa-10",
  restaurantId: "rest-1",
  locationId: "loc-1",
  label: "Varanda 02",
  nome: "Varanda 02",
  qrCodeToken: "varanda-02-token",
  area: "Varanda",
  serviceMode: "individual_tabs",
  capacity: 6,
  capacidade: 6,
  isActive: true,
  status: "ocupada",
  pessoasConectadas: 4,
  ocupacaoInicio: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  filialId: "loc-1",
  sessionId: null,
};

const meta: Meta<typeof MesaCard> = {
  title: "Tables/MesaCard",
  component: MesaCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MesaCard>;

export const Occupied: Story = {
  args: {
    mesa: baseMesa,
    onToggleOccupancy: () => undefined,
    onOpenQr: () => undefined,
    onConnect: () => undefined,
    onEdit: () => undefined,
    onViewOrder: () => undefined,
    onMore: () => undefined,
  },
};

export const Reserved: Story = {
  args: {
    mesa: {
      ...baseMesa,
      nome: "Salão 05",
      status: "reservada",
      area: "Salão principal",
      pessoasConectadas: 0,
      reserva: {
        nomeCliente: "Carla Fernandes",
        horario: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        telefone: "(11) 99876-5521",
      },
    },
    onToggleOccupancy: () => undefined,
    onOpenQr: () => undefined,
    onConnect: () => undefined,
    onEdit: () => undefined,
    onViewOrder: () => undefined,
    onMore: () => undefined,
  },
};
