import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text } from "@/components/primitives/text/Text";

const meta: Meta<typeof Text> = {
  title: "Primitives/Text",
  component: Text,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: { children: "Texto de exemplo" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Text variant="h1">Heading 1 — Título Principal</Text>
      <Text variant="h2">Heading 2 — Seção</Text>
      <Text variant="h3">Heading 3 — Subseção</Text>
      <Text variant="h4">Heading 4 — Card Title</Text>
      <Text variant="body">Body — Texto corrido padrão da aplicação.</Text>
      <Text variant="sm">Small — Texto de apoio menor.</Text>
      <Text variant="xs">Extra small — Metadados e timestamps.</Text>
      <Text variant="label">Label — RÓTULO DE CAMPO</Text>
      <Text variant="mono">mono — const value = "code";</Text>
    </div>
  ),
};

export const Muted: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text variant="body">Texto normal</Text>
      <Text variant="body" muted>Texto muted</Text>
      <Text variant="sm" muted>Small muted</Text>
    </div>
  ),
};
