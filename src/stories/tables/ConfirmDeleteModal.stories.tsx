import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/Button";
import { ConfirmDeleteModal } from "@/features/tables/components/ConfirmDeleteModal";
import type { Mesa } from "@/features/tables/model";

const mesa: Mesa = {
  id: "mesa-2",
  restaurantId: "rest-1",
  locationId: "loc-1",
  label: "Mesa VIP",
  nome: "Mesa VIP",
  area: "Varanda",
  serviceMode: "shared_tab",
  qrCodeToken: "token-2",
  capacity: 6,
  capacidade: 6,
  isActive: true,
  status: "livre",
  pessoasConectadas: 0,
  filialId: "loc-1",
  sessionId: null,
};

const meta: Meta<typeof ConfirmDeleteModal> = {
  title: "Tables/ConfirmDeleteModal",
  component: ConfirmDeleteModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConfirmDeleteModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Excluir mesa
        </Button>
        <ConfirmDeleteModal
          open={open}
          mesa={mesa}
          onOpenChange={setOpen}
          onConfirm={async () => {
            setOpen(false);
          }}
        />
      </div>
    );
  },
};
