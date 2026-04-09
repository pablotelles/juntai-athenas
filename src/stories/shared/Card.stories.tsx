import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/shared/card/Card";
import { Button } from "@/components/primitives/button/Button";

const meta: Meta<typeof Card> = {
  title: "Shared/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
        <CardDescription>Descrição opcional do card</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Conteúdo do card aqui.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">Cancelar</Button>
        <Button size="sm">Confirmar</Button>
      </CardFooter>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-80 p-6">
      <p className="text-sm">Card simples sem header ou footer.</p>
    </Card>
  ),
};
