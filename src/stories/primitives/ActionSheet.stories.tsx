import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QrCode, Receipt, Users } from "lucide-react";
import { ActionSheet } from "@/components/primitives/action-sheet/ActionSheet";
import { Button } from "@/components/primitives/button/Button";

const meta: Meta<typeof ActionSheet> = {
  title: "Primitives/ActionSheet",
  component: ActionSheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ActionSheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Abrir ações</Button>
        <ActionSheet
          open={open}
          onClose={() => setOpen(false)}
          items={[
            {
              key: "qr",
              label: "Gerar QR Code",
              icon: <QrCode className="h-4 w-4" />,
              onSelect: () => undefined,
            },
            {
              key: "connect",
              label: "Conectar usuário",
              icon: <Users className="h-4 w-4" />,
              onSelect: () => undefined,
            },
            {
              key: "bill",
              label: "Ver comanda",
              icon: <Receipt className="h-4 w-4" />,
              onSelect: () => undefined,
            },
          ]}
        />
      </div>
    );
  },
};
