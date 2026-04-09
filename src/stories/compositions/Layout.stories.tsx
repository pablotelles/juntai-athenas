"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageContainer, Stack, Grid, Section, FormGrid } from "@/components/compositions/layout/Layout";
import { Input } from "@/components/primitives/input/Input";
import { Button } from "@/components/primitives/button/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/shared/card/Card";
import { Badge } from "@/components/primitives/badge/Badge";

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Compositions/Layout",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj;

// ── Helpers ───────────────────────────────────────────────────────────────────

function Placeholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted text-muted-foreground text-sm py-6 px-4 ${className ?? ""}`}
    >
      {label}
    </div>
  );
}

// ── PageContainer ─────────────────────────────────────────────────────────────

/**
 * **PageContainer** — constrains content width and applies responsive horizontal padding.
 * Resize the viewport to see how the max-width and padding adapt.
 */
export const PageContainerStory: Story = {
  name: "PageContainer",
  render: () => (
    <div className="bg-background min-h-screen py-8">
      <PageContainer>
        <div className="flex flex-col gap-4">
          <Placeholder label="Full-width content inside PageContainer" />
          <div className="grid grid-cols-3 gap-4">
            <Placeholder label="1/3" />
            <Placeholder label="1/3" />
            <Placeholder label="1/3" />
          </div>
        </div>
      </PageContainer>
    </div>
  ),
};

/** **PageContainer unconstrained** — full width, padding only */
export const PageContainerUnconstrained: Story = {
  render: () => (
    <div className="bg-background min-h-screen py-8">
      <PageContainer constrained={false}>
        <Placeholder label="Unconstrained — full width with only padding" />
      </PageContainer>
    </div>
  ),
};

// ── Stack ─────────────────────────────────────────────────────────────────────

/** All **Stack** gap variants */
export const StackGaps: Story = {
  render: () => (
    <div className="p-8 bg-background flex flex-wrap gap-12">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
        <div key={gap} className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-mono">gap="{gap}"</p>
          <Stack gap={gap}>
            <Placeholder label="Item 1" className="w-48" />
            <Placeholder label="Item 2" className="w-48" />
            <Placeholder label="Item 3" className="w-48" />
          </Stack>
        </div>
      ))}
    </div>
  ),
};

// ── Grid ──────────────────────────────────────────────────────────────────────

/**
 * **Grid** — responsive column grid.
 * Resize the viewport to see it collapse from multi-column to single column.
 */
export const GridCols: Story = {
  render: () => (
    <div className="p-8 bg-background flex flex-col gap-10">
      {([1, 2, 3, 4] as const).map((cols) => (
        <div key={cols} className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-mono">cols={cols}</p>
          <Grid cols={cols}>
            {Array.from({ length: cols * 2 }).map((_, i) => (
              <Placeholder key={i} label={`Cell ${i + 1}`} />
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};

/** **Grid** at mobile viewport — always 1 column */
export const GridMobile: Story = {
  render: () => (
    <div className="p-4 bg-background">
      <Grid cols={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Placeholder key={i} label={`Cell ${i + 1}`} />
        ))}
      </Grid>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

// ── Section ───────────────────────────────────────────────────────────────────

/** **Section** — titled content area with optional actions */
export const SectionStory: Story = {
  name: "Section",
  render: () => (
    <div className="p-8 bg-background flex flex-col gap-8">
      <Section
        title="Pedidos recentes"
        description="Últimos pedidos da filial selecionada"
        actions={<Button size="sm">Ver todos</Button>}
      >
        <Grid cols={2}>
          <Card>
            <CardHeader>
              <CardTitle>Pedido #001</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="warning">Pendente</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pedido #002</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="info">Preparando</Badge>
            </CardContent>
          </Card>
        </Grid>
      </Section>

      <Section title="Sem actions">
        <Placeholder label="Conteúdo da seção" />
      </Section>

      <Section>
        <Placeholder label="Seção sem título — só wrapper de gap" />
      </Section>
    </div>
  ),
};

// ── FormGrid ──────────────────────────────────────────────────────────────────

/**
 * **FormGrid** — responsive form layout.
 * 1 column on mobile, `cols` on md+.
 * All inputs use `w-full` automatically.
 */
export const FormGridStory: Story = {
  name: "FormGrid — Default (2 cols)",
  render: () => (
    <div className="p-8 bg-background max-w-2xl">
      <Stack>
        <h2 className="text-base font-semibold text-foreground">
          Novo restaurante
        </h2>
        <FormGrid>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Nome</label>
            <Input placeholder="Ex: Boteco da Praça" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Slug</label>
            <Input placeholder="boteco-da-praca" />
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-foreground">Endereço</label>
            <Input placeholder="Rua das Flores, 123" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Cidade</label>
            <Input placeholder="São Paulo" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">CEP</label>
            <Input placeholder="01310-100" />
          </div>
        </FormGrid>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </div>
      </Stack>
    </div>
  ),
};

/** **FormGrid mobile** — collapses to 1 column */
export const FormGridMobile: Story = {
  render: FormGridStory.render,
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

/** **FormGrid 3 cols** */
export const FormGrid3Cols: Story = {
  name: "FormGrid — 3 cols",
  render: () => (
    <div className="p-8 bg-background max-w-3xl">
      <FormGrid cols={3}>
        {["Nome", "E-mail", "Telefone", "Cargo", "Filial", "Data de entrada"].map(
          (label) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{label}</label>
              <Input placeholder={label} />
            </div>
          ),
        )}
      </FormGrid>
    </div>
  ),
};

// ── Composition ───────────────────────────────────────────────────────────────

/** **Full page composition** — all primitives working together */
export const FullPageComposition: Story = {
  render: () => (
    <div className="bg-background min-h-screen py-8">
      <PageContainer>
        <Stack gap="xl">
          <Section
            title="Visão geral"
            description="Dashboard da plataforma"
            actions={<Button size="sm">Exportar</Button>}
          >
            <Grid cols={4}>
              {[
                { label: "Restaurantes", value: "142" },
                { label: "Usuários", value: "1.847" },
                { label: "Pedidos hoje", value: "389" },
                { label: "Receita", value: "R$ 12.450" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Section>

          <Section title="Formulário de exemplo">
            <FormGrid>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Nome</label>
                <Input placeholder="Digite o nome" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">E-mail</label>
                <Input placeholder="email@exemplo.com" />
              </div>
            </FormGrid>
          </Section>
        </Stack>
      </PageContainer>
    </div>
  ),
};
