"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ComboboxOption {
  /** Unique identifier — used as the selected value */
  value: string;
  /** Primary display label */
  label: string;
  /** Secondary text shown below the label */
  description?: string;
  /** URL for an avatar/thumbnail. Pass empty string "" to show initials fallback. */
  image?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Available options */
  options: ComboboxOption[];
  /** Currently selected value (controlled) */
  value?: string;
  /** Called when the user picks an option */
  onChange?: (value: string) => void;
  /** Placeholder shown in the trigger when nothing is selected */
  placeholder?: string;
  /** Placeholder inside the search input */
  searchPlaceholder?: string;
  /** Shows a spinner in the trigger and skeleton rows in the list */
  loading?: boolean;
  disabled?: boolean;
  /** Highlights the trigger border in red */
  error?: boolean;
  /** Message shown when the filtered list is empty */
  emptyMessage?: string;
  /** Enable / disable the built-in search input (default: true) */
  searchable?: boolean;
  /**
   * Called on every keystroke in the search input.
   * When provided, internal filtering is disabled — the caller
   * is responsible for passing the filtered `options`.
   */
  onSearch?: (query: string) => void;
  className?: string;
  /**
   * Custom renderer for each option in the list.
   * Receives the option and whether it is currently selected.
   */
  renderOption?: (
    option: ComboboxOption,
    isSelected: boolean,
  ) => React.ReactNode;
  /**
   * Custom renderer for the selected value shown in the trigger.
   * Receives the currently selected option.
   */
  renderSelected?: (option: ComboboxOption) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────

function ImageAvatar({ src, label }: { src: string; label: string }) {
  const [errored, setErrored] = React.useState(false);
  const initials = label.slice(0, 2).toUpperCase();

  if (!src || errored) {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="h-8 w-8 shrink-0 rounded-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}

function DefaultOptionRenderer({
  option,
  isSelected,
}: {
  option: ComboboxOption;
  isSelected: boolean;
}) {
  const hasImage = option.image !== undefined;

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {hasImage && <ImageAvatar src={option.image!} label={option.label} />}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground truncate">
          {option.label}
        </span>
        {option.description && (
          <span className="text-xs text-muted-foreground truncate">
            {option.description}
          </span>
        )}
      </div>
      {isSelected && (
        <Check className="ml-auto shrink-0 h-4 w-4 text-primary" />
      )}
    </div>
  );
}

function DefaultSelectedRenderer({ option }: { option: ComboboxOption }) {
  const hasImage = option.image !== undefined;
  return (
    <div className="flex items-center gap-2 min-w-0">
      {hasImage && <ImageAvatar src={option.image!} label={option.label} />}
      <span className="truncate text-foreground text-sm">{option.label}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-1 space-y-0.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-md">
          <div className="h-8 w-8 shrink-0 rounded-full bg-border animate-pulse" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 w-32 bg-border animate-pulse rounded" />
            <div className="h-2.5 w-20 bg-border animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Combobox
// ─────────────────────────────────────────────────────────────

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  loading = false,
  disabled = false,
  error = false,
  emptyMessage = "Nenhuma opção encontrada.",
  searchable = true,
  onSearch,
  className,
  renderOption,
  renderSelected,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedOption = options.find((o) => o.value === value);

  // When onSearch is provided, the caller controls filtering
  const displayedOptions =
    onSearch || !search.trim()
      ? options
      : options.filter(
          (o) =>
            o.label.toLowerCase().includes(search.toLowerCase()) ||
            o.description?.toLowerCase().includes(search.toLowerCase()),
        );

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    onSearch?.(e.target.value);
  }

  function handleSelect(optionValue: string) {
    // Clicking the already-selected option clears it
    onChange?.(optionValue === value ? "" : optionValue);
    setOpen(false);
    setSearch("");
    onSearch?.("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSearch("");
      onSearch?.("");
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2",
            "text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors",
            error && "border-destructive focus:ring-destructive",
            className,
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            {selectedOption ? (
              renderSelected ? (
                renderSelected(selectedOption)
              ) : (
                <DefaultSelectedRenderer option={selectedOption} />
              )
            ) : (
              <span className="text-sm text-muted-foreground truncate">
                {placeholder}
              </span>
            )}
          </div>
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          style={{ width: "var(--radix-popover-trigger-width)" }}
          className={cn(
            "z-50 min-w-[200px] rounded-md border border-border bg-surface shadow-md overflow-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                value={search}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                aria-label="Buscar opções"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {loading && (
                <Loader2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground animate-spin" />
              )}
            </div>
          )}

          <div role="listbox" className="max-h-64 overflow-y-auto p-1">
            {loading && displayedOptions.length === 0 ? (
              <LoadingSkeleton />
            ) : displayedOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              displayedOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none text-left",
                      "hover:bg-secondary focus-visible:bg-secondary",
                      "disabled:pointer-events-none disabled:opacity-50",
                      "transition-colors",
                      isSelected && "bg-secondary",
                    )}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <DefaultOptionRenderer
                        option={option}
                        isSelected={isSelected}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
