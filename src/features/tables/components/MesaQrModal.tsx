"use client";

import * as React from "react";
import { Download, PlugZap } from "lucide-react";
import { Button } from "@/components/primitives/button/Button";
import { Text } from "@/components/primitives/text/Text";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/shared/modal/Modal";
import type { Mesa } from "../model";

function buildMatrix(seed: string, size = 21) {
  let state = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 97);

  const isFinder = (row: number, col: number) => {
    const corners = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ];

    return corners.some(([startRow, startCol]) => {
      const withinRow = row >= startRow && row < startRow + 7;
      const withinCol = col >= startCol && col < startCol + 7;
      if (!withinRow || !withinCol) return false;
      const localRow = row - startRow;
      const localCol = col - startCol;
      return (
        localRow === 0 ||
        localRow === 6 ||
        localCol === 0 ||
        localCol === 6 ||
        (localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4)
      );
    });
  };

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      if (isFinder(row, col)) return true;
      state = (state * 1103515245 + 12345 + row + col) % 2147483647;
      return state % 2 === 0;
    }),
  );
}

function createSvg(matrix: boolean[][]) {
  const size = matrix.length;
  const cell = 10;
  const dimension = size * cell;
  const cells = matrix
    .flatMap((row, rowIndex) =>
      row.map((value, colIndex) =>
        value
          ? `<rect x="${colIndex * cell}" y="${rowIndex * cell}" width="${cell}" height="${cell}" fill="#111827" />`
          : "",
      ),
    )
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}">
      <rect width="100%" height="100%" fill="#ffffff" rx="24" />
      ${cells}
    </svg>
  `;
}

export interface MesaQrModalProps {
  mesa: Mesa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSimulateConnection?: (mesa: Mesa) => void;
}

export function MesaQrModal({
  mesa,
  open,
  onOpenChange,
  onSimulateConnection,
}: MesaQrModalProps) {
  const matrix = React.useMemo(
    () => buildMatrix(mesa?.qrCodeToken ?? "mesa"),
    [mesa?.qrCodeToken],
  );

  const handleDownload = () => {
    if (!mesa) return;
    const svg = createSvg(matrix);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${mesa.nome.toLowerCase().replace(/\s+/g, "-")}-qr.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-xl">
        <ModalHeader>
          <ModalTitle>
            {mesa ? `QR Code · ${mesa.nome}` : "QR Code da mesa"}
          </ModalTitle>
          <ModalDescription>
            Compartilhe este código com clientes ou equipe para conexão rápida.
          </ModalDescription>
        </ModalHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-[28px] border border-border bg-white p-4 shadow-sm">
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${matrix.length}, minmax(0, 1fr))`,
              }}
            >
              {matrix.flatMap((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <span
                    key={`${rowIndex}-${colIndex}`}
                    className={
                      cell
                        ? "h-2.5 w-2.5 rounded-[2px] bg-slate-900"
                        : "h-2.5 w-2.5 rounded-[2px] bg-transparent"
                    }
                  />
                )),
              )}
            </div>
          </div>

          {mesa ? (
            <div className="w-full rounded-2xl bg-secondary/40 p-3 text-center">
              <Text variant="sm" className="font-medium">
                Token: <span className="font-mono">{mesa.qrCodeToken}</span>
              </Text>
            </div>
          ) : null}
        </div>

        <ModalFooter className="flex-col sm:flex-row">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Baixar SVG
          </Button>
          <Button
            onClick={() => {
              if (mesa) onSimulateConnection?.(mesa);
            }}
          >
            <PlugZap className="h-4 w-4" />
            Conectar agora
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
