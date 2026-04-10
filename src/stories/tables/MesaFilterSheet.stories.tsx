import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/Button";
import { MesaFilterSheet } from "@/features/tables/components/MesaFilterSheet";

const meta: Meta<typeof MesaFilterSheet> = {
  title: "Tables/MesaFilterSheet",
  component: MesaFilterSheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MesaFilterSheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<"todas" | "livre" | "ocupada" | "reservada" | "inativa">("todas");

    return (
      <div>
        <Button onClick={() => setOpen(true)}>Abrir filtros</Button>
        <MesaFilterSheet
          open={open}
          onClose={() => setOpen(false)}
          value={value}
          onChange={setValue}
          counts={{
            todas: 12,
            livre: 5,
            ocupada: 4,
            reservada: 2,
            inativa: 1,
          }}
        />
      </div>
    );
  },
};
