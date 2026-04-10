import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/Button";
import { MesaFormModal } from "@/features/tables/components/MesaFormModal";
import type { Mesa } from "@/features/tables/model";

const mesas: Mesa[] = [
  {
    id: "mesa-1",
    restaurantId: "rest-1",
    locationId: "loc-1",
    label: "Mesa 01",
    nome: "Mesa 01",
    area: "Salão",
    serviceMode: "shared_tab",
    qrCodeToken: "token-1",
    capacity: 4,
    capacidade: 4,
    isActive: true,
    status: "livre",
    pessoasConectadas: 0,
    filialId: "loc-1",
    sessionId: null,
  },
];

const meta: Meta<typeof MesaFormModal> = {
  title: "Tables/MesaFormModal",
  component: MesaFormModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MesaFormModal>;

export const Create: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Nova mesa</Button>
        <MesaFormModal
          open={open}
          mode="create"
          existingMesas={mesas}
          currentLocationName="Unidade Centro"
          onOpenChange={setOpen}
          onSubmit={async () => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};

export const Edit: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Editar mesa</Button>
        <MesaFormModal
          open={open}
          mode="edit"
          mesa={mesas[0]}
          existingMesas={mesas}
          currentLocationName="Unidade Centro"
          onOpenChange={setOpen}
          onSubmit={async () => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};
