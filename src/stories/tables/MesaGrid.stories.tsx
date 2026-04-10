import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MesaGrid } from "@/features/tables/components/MesaGrid";
import { MesaCard } from "@/features/tables/components/MesaCard";
import type { Mesa } from "@/features/tables/model";

const mesas: Mesa[] = [
  {
    id: "1",
    restaurantId: "rest-1",
    locationId: "loc-1",
    label: "Mesa 01",
    nome: "Mesa 01",
    qrCodeToken: "token-1",
    area: "Salão",
    serviceMode: "shared_tab",
    capacity: 4,
    capacidade: 4,
    isActive: true,
    status: "livre",
    pessoasConectadas: 0,
    filialId: "loc-1",
    sessionId: null,
  },
  {
    id: "2",
    restaurantId: "rest-1",
    locationId: "loc-1",
    label: "Varanda 02",
    nome: "Varanda 02",
    qrCodeToken: "token-2",
    area: "Varanda",
    serviceMode: "individual_tabs",
    capacity: 6,
    capacidade: 6,
    isActive: true,
    status: "ocupada",
    pessoasConectadas: 3,
    ocupacaoInicio: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    filialId: "loc-1",
    sessionId: null,
  },
];

const meta: Meta<typeof MesaGrid> = {
  title: "Tables/MesaGrid",
  component: MesaGrid,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MesaGrid>;

export const Default: Story = {
  render: () => (
    <MesaGrid>
      {mesas.map((mesa) => (
        <MesaCard
          key={mesa.id}
          mesa={mesa}
          onToggleOccupancy={() => undefined}
          onOpenQr={() => undefined}
          onConnect={() => undefined}
          onEdit={() => undefined}
          onViewOrder={() => undefined}
          onMore={() => undefined}
        />
      ))}
    </MesaGrid>
  ),
};
