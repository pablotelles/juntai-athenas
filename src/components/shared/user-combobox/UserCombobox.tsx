"use client";

import * as React from "react";
import { Combobox } from "@/components/shared/combobox/Combobox";
import { useUsers } from "@/features/users/hooks";

// @ai-canonical — USE THIS for all user search/selection. Never inline the search logic again.
// Pattern: Combobox + useUsers + 250ms debounce. See RestaurantFormModal for previous inline version.

export interface UserComboboxProps {
  value?: string;
  onChange?: (userId: string) => void;
  placeholder?: string;
  /** IDs to exclude from results (e.g. already-added members) */
  excludeIds?: string[];
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function UserCombobox({
  value,
  onChange,
  placeholder = "Pesquisar usuário por nome ou e-mail",
  excludeIds,
  disabled,
  error,
  className,
}: UserComboboxProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const { data: page, isLoading } = useUsers(
    debouncedSearch
      ? { name: debouncedSearch, email: debouncedSearch, page: 1, limit: 20 }
      : { page: 1, limit: 20 },
  );

  const options = React.useMemo(() => {
    return (page?.data ?? [])
      .filter((u) => u.type === "user")
      .filter((u) => !excludeIds?.includes(u.id))
      .map((u) => ({
        value: u.id,
        label: u.name?.trim() || u.email || u.id,
        description: u.email ?? u.id,
      }));
  }, [page?.data, excludeIds]);

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Nome ou e-mail…"
      loading={isLoading}
      disabled={disabled}
      error={error}
      emptyMessage="Nenhum usuário encontrado"
      onSearch={setSearch}
      className={className}
    />
  );
}
