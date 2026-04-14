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
import { SimulatedClientControls } from "./SimulatedClientControls";
import type { SimulatedClient } from "./types";

interface SessionTestTableOption {
  id: string;
  label: string;
  area?: string | null;
  activeSessionId?: string | null;
}

export interface SimulatedClientsModalProps {
  open: boolean;
  tableId: string;
  sessionId: string | null;
  tables: SessionTestTableOption[];
  displayName: string;
  isPending: boolean;
  clients: SimulatedClient[];
  activeClientId: string | null;
  onOpenChange: (open: boolean) => void;
  onTableChange: (tableId: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSimulate: () => void;
  onSelectClient: (clientId: string) => void;
  onRemoveClient: (clientId: string) => void;
}

export function SimulatedClientsModal({
  open,
  tableId,
  sessionId,
  tables,
  displayName,
  isPending,
  clients,
  activeClientId,
  onOpenChange,
  onTableChange,
  onDisplayNameChange,
  onSimulate,
  onSelectClient,
  onRemoveClient,
}: SimulatedClientsModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md p-0">
        <ModalHeader className="border-b border-border px-5 py-4">
          <ModalTitle>Gerenciar clientes simulados</ModalTitle>
          <ModalDescription>
            Selecione a mesa, adicione novos convidados e alterne o preview ativo.
          </ModalDescription>
        </ModalHeader>

        <div className="px-5 py-4">
          <SimulatedClientControls
            tableId={tableId}
            sessionId={sessionId}
            tables={tables}
            displayName={displayName}
            isPending={isPending}
            clients={clients}
            activeClientId={activeClientId}
            onTableChange={onTableChange}
            onDisplayNameChange={onDisplayNameChange}
            onSimulate={onSimulate}
            onSelectClient={onSelectClient}
            onRemoveClient={onRemoveClient}
          />
        </div>

        <ModalFooter className="border-t border-border px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}