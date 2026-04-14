"use client";

import * as React from "react";
import { Combobox } from "@/components/shared/combobox/Combobox";
import { useAllRestaurants } from "@/features/restaurants/hooks";

// @ai-canonical — USE THIS whenever the user needs to pick a restaurant.
// Filters locally (list is small). Does NOT set the active context — caller controls that.

export interface RestaurantComboboxProps {
  value?: string;
  onChange?: (restaurantId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function RestaurantCombobox({
  value,
  onChange,
  placeholder = "Selecionar restaurante",
  disabled,
  error,
  className,
}: RestaurantComboboxProps) {
  const [search, setSearch] = React.useState("");
  const { data: restaurants = [], isLoading } = useAllRestaurants();

  const options = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.slug.includes(q))
      .map((r) => ({
        value: r.id,
        label: r.name,
        description: r.slug,
      }));
  }, [restaurants, search]);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Pesquisar restaurante…"
      loading={isLoading}
      disabled={disabled}
      error={error}
      emptyMessage="Nenhum restaurante encontrado"
      onSearch={setSearch}
      className={className}
    />
  );
}
