"use client";

import * as React from "react";

// ─── Context ──────────────────────────────────────────────────────────────────

type LabelMap = Map<string, string>;

interface BreadcrumbContextValue {
  labels: LabelMap;
  setLabel: (segment: string, label: string) => void;
  clearLabel: (segment: string) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [labels, setLabels] = React.useState<LabelMap>(new Map());

  const setLabel = React.useCallback((segment: string, label: string) => {
    setLabels((prev) => new Map(prev).set(segment, label));
  }, []);

  const clearLabel = React.useCallback((segment: string) => {
    setLabels((prev) => {
      const next = new Map(prev);
      next.delete(segment);
      return next;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel, clearLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useBreadcrumbContext() {
  const ctx = React.useContext(BreadcrumbContext);
  if (!ctx) throw new Error("useBreadcrumbContext must be used within BreadcrumbProvider");
  return ctx;
}

/**
 * Registra o label de um segmento de URL na página atual.
 * Limpa automaticamente quando o componente desmonta.
 *
 * @example
 * useBreadcrumbLabel(params.menuId, menu.name)
 */
export function useBreadcrumbLabel(segment: string | null | undefined, label: string | null | undefined) {
  const { setLabel, clearLabel } = useBreadcrumbContext();

  React.useEffect(() => {
    if (!segment || !label) return;
    setLabel(segment, label);
    return () => clearLabel(segment);
  }, [segment, label, setLabel, clearLabel]);
}
