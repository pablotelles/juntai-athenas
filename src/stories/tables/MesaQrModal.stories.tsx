import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/Button";
import { MesaQrModal } from "@/features/tables/components/MesaQrModal";
import type { Mesa } from "@/features/tables/model";

const mesa: Mesa = {
  id: "mesa-01",
  restaurantId: "rest-1",
  locationId: "loc-1",
  label: "Mesa 01",
  nome: "Mesa 01",
  qrCodeToken: "demo-token-01",
  capacity: 4,
  capacidade: 4,
  isActive: true,
  status: "livre",
  pessoasConectadas: 0,
  filialId: "loc-1",
  sessionId: null,
};

const meta: Meta<typeof MesaQrModal> = {
  title: "Tables/MesaQrModal",
  component: MesaQrModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MesaQrModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Abrir QR</Button>
        <MesaQrModal mesa={mesa} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};
