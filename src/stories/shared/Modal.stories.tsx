"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/shared/modal/Modal";
import { Button } from "@/components/primitives/button/Button";

const meta: Meta = {
  title: "Shared/Modal",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Abrir Modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirmar ação</ModalTitle>
          <ModalDescription>
            Esta ação não pode ser desfeita. Deseja continuar?
          </ModalDescription>
        </ModalHeader>
        <p className="text-sm text-muted-foreground">
          Ao confirmar, todos os dados selecionados serão permanentemente removidos do sistema.
        </p>
        <ModalFooter>
          <Button variant="outline">Cancelar</Button>
          <Button variant="destructive">Confirmar exclusão</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};
