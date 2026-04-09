"use client";

import * as React from "react";
import {
  Globe,
  Building2,
  UtensilsCrossed,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/shared/popover/Popover";
import { cn } from "@/lib/cn";
import {
  useActiveContext,
  type ActiveContextValue,
} from "@/contexts/active-context/ActiveContextProvider";
import { MOCK_GROUPS, findRestaurant, findGroup } from "@/config/mock-data";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function resolveLabel(ctx: ActiveContextValue): string {
  if (ctx.type === "platform") return "Plataforma";
  if (ctx.type === "group") return findGroup(ctx.groupId)?.name ?? ctx.groupId;
  return findRestaurant(ctx.restaurantId)?.name ?? ctx.restaurantId;
}

function ContextIcon({
  type,
  size = 14,
  className,
}: {
  type: ActiveContextValue["type"];
  size?: number;
  className?: string;
}) {
  if (type === "platform") return <Globe size={size} className={className} />;
  if (type === "group") return <Building2 size={size} className={className} />;
  return <UtensilsCrossed size={size} className={className} />;
}

// ─────────────────────────────────────────────────────────────
// ContextSwitcher
// ─────────────────────────────────────────────────────────────

export function ContextSwitcher() {
  const { context, setContext } = useActiveContext();
  const [open, setOpen] = React.useState(false);

  function select(ctx: ActiveContextValue) {
    setContext(ctx);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn(
            "flex items-center gap-2 rounded-md border border-border bg-surface px-3 h-8",
            "text-sm font-medium text-foreground max-w-[200px]",
            "hover:bg-secondary transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]",
          )}
        >
          <ContextIcon
            type={context.type}
            className="shrink-0 text-muted-foreground"
          />
          <span className="truncate">{resolveLabel(context)}</span>
          <ChevronDown
            size={12}
            className={cn(
              "shrink-0 text-muted-foreground transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-60 p-0 overflow-hidden"
      >
        {/* Platform */}
        <div className="p-1 border-b border-border">
          <ContextOption
            label="Plataforma"
            icon={<Globe size={14} />}
            isActive={context.type === "platform"}
            onClick={() => select({ type: "platform" })}
          />
        </div>

        {/* Groups + their restaurants */}
        <div
          role="listbox"
          aria-label="Selecionar contexto"
          className="max-h-64 overflow-y-auto p-1"
        >
          {MOCK_GROUPS.map((group) => (
            <div key={group.id}>
              <ContextOption
                label={group.name}
                icon={<Building2 size={14} />}
                isActive={
                  context.type === "group" && context.groupId === group.id
                }
                onClick={() => select({ type: "group", groupId: group.id })}
              />
              {group.restaurants.map((r) => (
                <ContextOption
                  key={r.id}
                  label={r.name}
                  icon={<UtensilsCrossed size={13} />}
                  isActive={
                    context.type === "restaurant" &&
                    context.restaurantId === r.id
                  }
                  onClick={() =>
                    select({ type: "restaurant", restaurantId: r.id })
                  }
                  indent
                />
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────
// ContextOption (internal)
// ─────────────────────────────────────────────────────────────

function ContextOption({
  label,
  icon,
  isActive,
  onClick,
  indent = false,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
        "hover:bg-secondary focus-visible:bg-secondary outline-none",
        "transition-colors",
        indent && "pl-6",
        isActive && "bg-secondary",
      )}
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span
        className={cn(
          "flex-1 truncate text-foreground",
          isActive && "font-medium",
        )}
      >
        {label}
      </span>
      {isActive && <Check size={12} className="text-primary shrink-0" />}
    </button>
  );
}
