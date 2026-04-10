"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToastProvider, useToast } from "@/contexts/toast/ToastProvider";
import { Toaster } from "@/components/primitives/toast/Toast";
import { Button } from "@/components/primitives/button/Button";

// ─── Decorator ────────────────────────────────────────────────────────────────
// Todas as stories precisam do ToastProvider + Toaster no canvas.

function withToastProvider(Story: React.ComponentType) {
  return (
    <ToastProvider>
      <Story />
      <Toaster />
    </ToastProvider>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Primitives/Toast",
  tags: ["autodocs"],
  decorators: [withToastProvider],
  parameters: {
    // deixar canvas alto o suficiente para ver os toasts fixos
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj;

// ─── Playground ───────────────────────────────────────────────────────────────
// Dispara cada variante ao clicar. Caso de uso principal.

function PlaygroundDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-6 p-8 min-h-96">
      <p className="text-sm text-muted-foreground">
        Clique nos botões para disparar cada variante de toast.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="default"
          onClick={() =>
            toast.success("Menu criado!", {
              description: "O cardápio foi atualizado com sucesso.",
            })
          }
        >
          Success
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast.error("Falha ao salvar produto", {
              description: "Verifique sua conexão e tente novamente.",
            })
          }
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.info("Salvando produto...", {
              description: "Salvando 3 etapas de personalização.",
            })
          }
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("Etapa sem opções", {
              description: "Adicione ao menos uma opção antes de continuar.",
            })
          }
        >
          Warning
        </Button>
      </div>
    </div>
  );
}

export const Playground: Story = {
  render: () => <PlaygroundDemo />,
};

// ─── AllVariants ──────────────────────────────────────────────────────────────
// Exibe as 4 variantes simultaneamente no canvas, com duração longa para inspecionar.

function AllVariantsDemo() {
  const { toast } = useToast();
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const LONG = 120_000; // 2 min — tempo para inspecionar no Storybook

    toast.success("Produto salvo!", {
      description: "Pizza Margherita foi criada no cardápio.",
      duration: LONG,
    });
    toast.error("Erro ao salvar", {
      description: "Falha de conexão com o servidor.",
      duration: LONG,
    });
    toast.info("Processando...", {
      description: "Aguarde enquanto salvamos as etapas.",
      duration: LONG,
    });
    toast.warning("Atenção", {
      description: "Adicione ao menos uma opção à etapa.",
      duration: LONG,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-96 w-full flex items-start justify-start p-8">
      <p className="text-sm text-muted-foreground">
        Os 4 toasts aparecem fixos no canto inferior direito do canvas.
      </p>
    </div>
  );
}

export const AllVariants: Story = {
  render: () => <AllVariantsDemo />,
};

// ─── WithDescription ──────────────────────────────────────────────────────────

function WithDescriptionDemo() {
  const { toast } = useToast();

  return (
    <div className="flex gap-3 p-8 min-h-52">
      <Button
        onClick={() =>
          toast.success("Menu criado!", {
            description: "O cardápio foi atualizado com sucesso.",
          })
        }
      >
        Com descrição
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.success("Menu criado!")}
      >
        Sem descrição
      </Button>
    </div>
  );
}

export const WithDescription: Story = {
  render: () => <WithDescriptionDemo />,
};

// ─── CustomDuration ───────────────────────────────────────────────────────────

function CustomDurationDemo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-3 p-8 min-h-52">
      <Button
        size="sm"
        variant="outline"
        onClick={() => toast.info("Curto (1,5s)", { duration: 1_500 })}
      >
        1,5s
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => toast.info("Padrão (4s)", { duration: 4_000 })}
      >
        4s (padrão)
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => toast.info("Longo (8s)", { duration: 8_000 })}
      >
        8s
      </Button>
    </div>
  );
}

export const CustomDuration: Story = {
  render: () => <CustomDurationDemo />,
};

// ─── Stacked ─────────────────────────────────────────────────────────────────
// Simula múltiplos toasts simultâneos (ex: salvar produto com várias chamadas).

function StackedDemo() {
  const { toast } = useToast();

  const handleSaveProduct = () => {
    toast.info("Salvando produto...", { duration: 3_000 });
    setTimeout(() => toast.info("Criando etapas...", { duration: 3_000 }), 500);
    setTimeout(
      () =>
        toast.success("Produto criado!", {
          description: "Pizza Margherita disponível no cardápio.",
        }),
      1_200,
    );
  };

  return (
    <div className="flex gap-3 p-8 min-h-96">
      <Button onClick={handleSaveProduct}>Simular salvar produto</Button>
    </div>
  );
}

export const Stacked: Story = {
  render: () => <StackedDemo />,
};
