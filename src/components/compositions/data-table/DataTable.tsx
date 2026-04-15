"use client";

import * as React from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Checkbox } from "@/components/shared/checkbox/Checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shared/dropdown-menu/DropdownMenu";
import { Button } from "@/components/primitives/button/Button";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc" | null;

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface RowAction<T> {
  label: string;
  onClick: (row: T) => void;
  destructive?: boolean;
  hidden?: (row: T) => boolean;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface SelectionConfig<T> {
  selectedRows: T[];
  onSelectionChange: (rows: T[]) => void;
  rowId: (row: T) => string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  rowActions?: RowAction<T>[];
  pagination?: PaginationConfig;
  selection?: SelectionConfig<T>;
  emptyState?: React.ReactNode;
  className?: string;
  /**
   * Applied to the inner scroll container (the div wrapping the <table>).
   * Use this to set max-height when stickyHeader is true, e.g. "max-h-[60vh]".
   */
  scrollClassName?: string;
  onSortChange?: (key: string, direction: SortDirection) => void;
  /**
   * When provided, each row gets an expand toggle.
   * Clicking it renders the returned node in a full-width detail row below.
   */
  rowDetail?: (row: T, index: number) => React.ReactNode;
  /**
   * Required when `rowDetail` is used to track expanded state stably.
   * Falls back to row index if omitted.
   */
  rowId?: (row: T) => string;
  /**
   * When true, the thead sticks to the top of its scroll container.
   * Set scrollClassName with a max-height so vertical scrolling kicks in.
   */
  stickyHeader?: boolean;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div
                className="h-4 rounded bg-secondary animate-pulse"
                style={{ width: `${60 + ((c * 15) % 40)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ChevronUp className="h-3.5 w-3.5" />;
  if (direction === "desc") return <ChevronDown className="h-3.5 w-3.5" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  rowActions,
  pagination,
  selection,
  emptyState,
  className,
  scrollClassName,
  onSortChange,
  rowDetail,
  rowId,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>(null);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    new Set(),
  );

  const hasExpandCol = !!rowDetail;
  const totalCols =
    columns.length +
    (selection ? 1 : 0) +
    (rowActions?.length ? 1 : 0) +
    (hasExpandCol ? 1 : 0);

  const getRowKey = (row: T, index: number): string =>
    rowId ? rowId(row) : String(index);

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  function handleSort(key: string) {
    const next: SortDirection =
      sortKey !== key ? "asc" : sortDir === "asc" ? "desc" : null;
    setSortKey(next === null ? null : key);
    setSortDir(next);
    onSortChange?.(key, next);
  }

  // Selection helpers
  const allSelected =
    selection && data.length > 0
      ? data.every((row) =>
          selection.selectedRows.some(
            (r) => selection.rowId(r) === selection.rowId(row),
          ),
        )
      : false;

  const someSelected =
    selection && !allSelected
      ? data.some((row) =>
          selection.selectedRows.some(
            (r) => selection.rowId(r) === selection.rowId(row),
          ),
        )
      : false;

  function toggleAll() {
    if (!selection) return;
    if (allSelected) {
      selection.onSelectionChange(
        selection.selectedRows.filter(
          (r) => !data.some((d) => selection.rowId(d) === selection.rowId(r)),
        ),
      );
    } else {
      const newRows = data.filter(
        (row) =>
          !selection.selectedRows.some(
            (r) => selection.rowId(r) === selection.rowId(row),
          ),
      );
      selection.onSelectionChange([...selection.selectedRows, ...newRows]);
    }
  }

  function toggleRow(row: T) {
    if (!selection) return;
    const id = selection.rowId(row);
    const isSelected = selection.selectedRows.some(
      (r) => selection.rowId(r) === id,
    );
    if (isSelected) {
      selection.onSelectionChange(
        selection.selectedRows.filter((r) => selection.rowId(r) !== id),
      );
    } else {
      selection.onSelectionChange([...selection.selectedRows, row]);
    }
  }

  const isEmpty = !isLoading && data.length === 0;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-x-auto",
          stickyHeader && "overflow-y-auto",
          scrollClassName,
        )}
      >
        <table className="w-full text-sm">
          <thead
            className={cn(
              "border-b border-border bg-muted",
              stickyHeader && "sticky top-0 z-10",
            )}
          >
            <tr>
              {/* Expand toggle column */}
              {hasExpandCol && <th className="w-8 px-2 py-3" />}

              {selection && (
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={
                      allSelected || (someSelected ? "indeterminate" : false)
                    }
                    onCheckedChange={toggleAll}
                    aria-label="Selecionar todos"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.sortable &&
                      "cursor-pointer select-none hover:text-foreground transition-colors",
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <SortIcon
                        direction={sortKey === col.key ? sortDir : null}
                      />
                    )}
                  </span>
                </th>
              ))}
              {rowActions?.length ? <th className="w-10 px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={totalCols} />
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-4 py-16 text-center text-sm text-muted-foreground"
                >
                  {emptyState ?? "Nenhum resultado encontrado."}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const rowKey = getRowKey(row, i);
                const isExpanded = expandedRows.has(rowKey);
                const isRowSelected = selection
                  ? selection.selectedRows.some(
                      (r) => selection.rowId(r) === selection.rowId(row),
                    )
                  : false;

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      className={cn(
                        "border-b border-border transition-colors",
                        !isExpanded && "last:border-0",
                        "hover:bg-muted/60",
                        isRowSelected && "bg-primary/5",
                      )}
                    >
                      {/* Expand toggle */}
                      {hasExpandCol && (
                        <td className="w-8 px-2 py-3">
                          <button
                            type="button"
                            onClick={() => toggleExpand(rowKey)}
                            aria-label={isExpanded ? "Recolher" : "Expandir"}
                            className="flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-150",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </button>
                        </td>
                      )}

                      {selection && (
                        <td className="w-10 px-4 py-3">
                          <Checkbox
                            checked={isRowSelected}
                            onCheckedChange={() => toggleRow(row)}
                            aria-label="Selecionar linha"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            "px-4 py-3 text-foreground",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                          )}
                        >
                          {col.cell
                            ? col.cell(row, i)
                            : String(
                                (row as Record<string, unknown>)[col.key] ?? "",
                              )}
                        </td>
                      ))}
                      {rowActions?.length ? (
                        <td className="w-10 px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Ações"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {rowActions
                                .filter((a) => !a.hidden?.(row))
                                .map((action) => (
                                  <DropdownMenuItem
                                    key={action.label}
                                    destructive={action.destructive}
                                    onClick={() => action.onClick(row)}
                                  >
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      ) : null}
                    </tr>

                    {/* Detail row */}
                    {hasExpandCol && isExpanded && (
                      <tr className="border-b border-border last:border-0">
                        <td
                          colSpan={totalCols}
                          className="p-0"
                        >
                          <div className="border-t border-border bg-muted/30 px-6 py-3">
                            {rowDetail!(row, i)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {selection && selection.selectedRows.length > 0
              ? `${selection.selectedRows.length} selecionado(s) · `
              : ""}
            {pagination.total} resultado{pagination.total !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">
              Página {pagination.page} de{" "}
              {Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.page >=
                Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
