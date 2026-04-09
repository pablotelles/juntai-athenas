"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Globe,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  useActiveContext,
  type ActiveContextValue,
} from "@/contexts/active-context/ActiveContextProvider";
import { NAV_ITEMS } from "@/config/navigation";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
}

// ─────────────────────────────────────────────────────────────
// CommandPalette
// ─────────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { context, setContext, restaurants } = useActiveContext();
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K global shortcut
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Auto-focus input on open
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  // Build all palette items
  const allItems = React.useMemo((): PaletteItem[] => {
    const items: PaletteItem[] = [];

    // Navigation — filtered by active context
    for (const nav of NAV_ITEMS) {
      if (!nav.contexts.includes(context.type)) continue;
      const IconComp = nav.icon;
      items.push({
        id: `nav:${nav.href}`,
        label: nav.label,
        description: nav.href,
        group: "Navegação",
        icon: <IconComp size={14} />,
        action: () => {
          router.push(nav.href);
          setOpen(false);
        },
      });
    }

    // Context: platform
    items.push({
      id: "ctx:platform",
      label: "Plataforma",
      description: "Trocar para contexto de plataforma",
      group: "Trocar contexto",
      icon: <Globe size={14} />,
      action: () => {
        setContext({ type: "platform" });
        setOpen(false);
      },
    });

    // Context: restaurants
    for (const r of restaurants) {
      items.push({
        id: `ctx:restaurant:${r.id}`,
        label: r.name,
        description: "Trocar para este restaurante",
        group: "Restaurantes",
        icon: <UtensilsCrossed size={14} />,
        action: () => {
          setContext({ type: "restaurant", restaurantId: r.id });
          setOpen(false);
        },
      });
    }

    return items;
  }, [context.type, router, setContext, restaurants]);

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : allItems;

  const grouped = filtered.reduce<Record<string, PaletteItem[]>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {},
  );

  // ─── Trigger button (always rendered) ───────────────────────────────────────

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-md border border-border bg-surface px-3 h-8",
          "text-sm text-muted-foreground",
          "hover:bg-secondary transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]",
        )}
        aria-label="Abrir busca (⌘K)"
      >
        <Search size={13} className="shrink-0" />
        <span className="hidden sm:inline text-xs">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      {/* ─── Palette overlay + dialog ───────────────────────────────────────── */}

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Busca global"
            className={cn(
              "fixed left-1/2 top-[18vh] z-50 w-full max-w-lg -translate-x-1/2",
              "rounded-xl border border-border bg-surface shadow-xl overflow-hidden",
            )}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search size={16} className="shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar páginas, contextos, restaurantes..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                aria-label="Buscar"
              />
              <kbd className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-1">
              {Object.keys(grouped).length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(grouped).map(([group, groupItems]) => (
                  <div key={group} className="mb-1">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {group}
                    </p>
                    {groupItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm",
                          "hover:bg-secondary focus-visible:bg-secondary outline-none",
                          "transition-colors group",
                        )}
                      >
                        <span className="text-muted-foreground shrink-0">
                          {item.icon}
                        </span>
                        <span className="flex-1 truncate text-foreground">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[140px] hidden sm:block">
                            {item.description}
                          </span>
                        )}
                        <ArrowRight
                          size={12}
                          className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
