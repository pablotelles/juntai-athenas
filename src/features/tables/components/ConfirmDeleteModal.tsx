"use client";

import { Button } from "@/components/primitives/button/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/shared/modal/Modal";
import type { Mesa } from "../model";

export interface ConfirmDeleteModalProps {
  open: boolean;
  mesa?: Mesa | null;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmDeleteModal({
  open,
  mesa,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>Excluir mesa</ModalTitle>
          <ModalDescription>
            {mesa
              ? `Excluir mesa ${mesa.nome}? Essa ação não pode ser desfeita.`
              : "Essa ação não pode ser desfeita."}
          </ModalDescription>
        </ModalHeader>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isDeleting}
            onClick={() => void onConfirm()}
          >
            Excluir mesa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
