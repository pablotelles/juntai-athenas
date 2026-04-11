"use client";

import * as React from "react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shared/select/Select";
import { cn } from "@/lib/cn";
import { useLocations } from "@/features/restaurants/hooks";

interface LocationPickerProps {
  restaurantId: string;
  value: string | null;
  onChange: (locationId: string) => void;
  triggerClassName?: string;
}

export function LocationPicker({
  restaurantId,
  value,
  onChange,
  triggerClassName,
}: LocationPickerProps) {
  const { data: locations, isLoading } = useLocations(restaurantId);

  // Auto-select the first available location when no value is set
  React.useEffect(() => {
    if (!value && locations?.length && locations[0]) {
      onChange(locations[0].id);
    }
  }, [value, locations, onChange]);

  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger
        className={cn("w-56", triggerClassName)}
        loading={isLoading}
      >
        <SelectValue placeholder="Selecionar filial…" />
      </SelectTrigger>
      <SelectContent>
        {locations?.map((loc) => (
          <SelectItem key={loc.id} value={loc.id}>
            {loc.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
