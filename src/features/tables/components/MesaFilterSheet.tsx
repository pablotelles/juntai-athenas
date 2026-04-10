"use client";

import * as React from "react";
import {
  BottomSheet,
  BottomSheetActions,
  BottomSheetSection,
} from "@/components/primitives/bottom-sheet/BottomSheet";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
import {
  MESA_STATUS_LABELS,
  type MesaFilterValue,
  type MesaStatus,
} from "../model";

const FILTER_OPTIONS: MesaFilterValue[] = [
  "todas",
  "livre",
  "ocupada",
  "reservada",
  "inativa",
];

export interface MesaFilterSheetProps {
  open: boolean;
  onClose: () => void;
  value: MesaFilterValue;
  onChange: (value: MesaFilterValue) => void;
  counts: Record<MesaFilterValue, number>;
}

export function MesaFilterSheet({
  open,
  onClose,
  value,
  onChange,
  counts,
}: MesaFilterSheetProps) {
  const [draft, setDraft] = React.useState<MesaFilterValue>(value);

  React.useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Filtrar mesas">
      <BottomSheetSection label="Status">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <FilterChip
              key={option}
              active={draft === option}
              count={counts[option]}
              onClick={() => setDraft(option)}
            >
              {MESA_STATUS_LABELS[option]}
            </FilterChip>
          ))}
        </div>
      </BottomSheetSection>
      <BottomSheetActions
        onApply={() => {
          onChange(draft);
          onClose();
        }}
        onClear={() => {
          setDraft("todas");
          onChange("todas");
          onClose();
        }}
      />
    </BottomSheet>
  );
}
