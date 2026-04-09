"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shared/select/Select";
import { useLocations } from "@/features/restaurants/hooks";

interface LocationPickerProps {
  restaurantId: string;
  value: string | null;
  onChange: (locationId: string) => void;
}

export function LocationPicker({
  restaurantId,
  value,
  onChange,
}: LocationPickerProps) {
  const { data: locations, isLoading } = useLocations(restaurantId);

  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger className="w-56" loading={isLoading}>
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
