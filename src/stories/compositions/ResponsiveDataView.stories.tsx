"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  ResponsiveDataView,
  CardList,
  DataCard,
} from "@/components/compositions/responsive-data-view/ResponsiveDataView";
import { DataTable } from "@/components/compositions/data-table/DataTable";
import { Badge } from "@/components/primitives/badge/Badge";
import { Button } from "@/components/primitives/button/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shared/dropdown-menu/DropdownMenu";
import type {
  ColumnDef,
  RowAction,
} from "@/components/compositions/data-table/DataTable";
import type { BadgeVariant } from "@/components/primitives/badge/Badge";

// ── Mock data ─────────────────────────────────────────────────────────────────

type Order = {
  id: string;
  customer: string;
  table: string;
  total: string;
  items: number;
  status: "pending" | "preparing" | "delivered" | "cancelled";
};

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Pendente",
  preparing: "Preparando",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_VARIANT: Record<Order["status"], BadgeVariant> = {
  pending: "warning",
  preparing: "info",
  delivered: "success",
  cancelled: "destructive",
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    customer: "Ana Lima",
    table: "Mesa 3",
    total: "R$ 89,90",
    items: 3,
    status: "pending",
  },
  {
    id: "ORD-002",
    customer: "Bruno Sousa",
    table: "Mesa 7",
    total: "R$ 142,00",
    items: 5,
    status: "preparing",
  },
  {
    id: "ORD-003",
    customer: "Carla Dias",
    table: "Mesa 1",
    total: "R$ 55,50",
    items: 2,
    status: "delivered",
  },
  {
    id: "ORD-004",
    customer: "Diego Melo",
    table: "Mesa 12",
    total: "R$ 22,00",
    items: 1,
    status: "cancelled",
  },
  {
    id: "ORD-005",
    customer: "Eva Torres",
    table: "Mesa 5",
    total: "R$ 210,30",
    items: 7,
    status: "preparing",
  },
];

// ── Shared columns for DataTable ──────────────────────────────────────────────

const COLUMNS: ColumnDef<Order>[] = [
  {
    key: "id",
    header: "Pedido",
    cell: (row) => (
      <code className="font-mono text-xs text-muted-foreground">{row.id}</code>
    ),
  },
  {
    key: "customer",
    header: "Cliente",
    sortable: true,
    cell: (row) => <span className="font-medium">{row.customer}</span>,
  },
  {
    key: "table",
    header: "Mesa",
    cell: (row) => <span className="text-muted-foreground">{row.table}</span>,
  },
  {
    key: "items",
    header: "Itens",
    align: "right",
    cell: (row) => row.items,
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    cell: (row) => (
      <span className="font-medium tabular-nums">{row.total}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <Badge variant={STATUS_VARIANT[row.status]}>
        {STATUS_LABEL[row.status]}
      </Badge>
    ),
  },
];

const ROW_ACTIONS: RowAction<Order>[] = [
  { label: "Editar", onClick: (row) => alert(`Editar ${row.id}`) },
  {
    label: "Excluir",
    onClick: (row) => alert(`Excluir ${row.id}`),
    destructive: true,
  },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Compositions/ResponsiveDataView",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * **Auto** — switches between table and card based on actual viewport width.
 * Use the viewport selector in the toolbar to test mobile/desktop behavior.
 */
export const Auto: Story = {
  render: () => (
    <ResponsiveDataView
      table={
        <DataTable
          data={MOCK_ORDERS}
          columns={COLUMNS}
          rowActions={ROW_ACTIONS}
        />
      }
      card={
        <CardList
          data={MOCK_ORDERS}
          renderCard={(order) => (
            <DataCard
              key={order.id}
              title={order.customer}
              subtitle={order.id}
              badge={
                <Badge variant={STATUS_VARIANT[order.status]}>
                  {STATUS_LABEL[order.status]}
                </Badge>
              }
              fields={[
                { label: "Mesa", value: order.table },
                { label: "Itens", value: order.items },
                { label: "Total", value: order.total },
              ]}
              actions={
                <>
                  <Button variant="ghost" size="sm">
                    <Pencil size={14} className="mr-1" /> Editar
                  </Button>
                </>
              }
            />
          )}
        />
      }
    />
  ),
};

/** **Forced Table** — always shows the DataTable regardless of viewport */
export const ForceTable: Story = {
  render: () => (
    <ResponsiveDataView
      forceView="table"
      table={
        <DataTable
          data={MOCK_ORDERS}
          columns={COLUMNS}
          rowActions={ROW_ACTIONS}
        />
      }
      card={<CardList data={MOCK_ORDERS} renderCard={() => null} />}
    />
  ),
};

/** **Forced Card** — always shows the card list regardless of viewport */
export const ForceCard: Story = {
  render: () => (
    <ResponsiveDataView
      forceView="card"
      table={<DataTable data={MOCK_ORDERS} columns={COLUMNS} />}
      card={
        <CardList
          data={MOCK_ORDERS}
          renderCard={(order) => (
            <DataCard
              key={order.id}
              title={order.customer}
              subtitle={order.id}
              badge={
                <Badge variant={STATUS_VARIANT[order.status]}>
                  {STATUS_LABEL[order.status]}
                </Badge>
              }
              fields={[
                { label: "Mesa", value: order.table },
                { label: "Itens", value: order.items },
                { label: "Total", value: order.total },
              ]}
              actions={
                <Button variant="ghost" size="sm">
                  <Pencil size={14} className="mr-1" /> Editar
                </Button>
              }
            />
          )}
        />
      }
    />
  ),
};

/** **Loading** skeleton state in card mode */
export const LoadingCard: Story = {
  render: () => (
    <CardList data={[] as Order[]} renderCard={() => null} isLoading />
  ),
};

/** **Empty** state */
export const Empty: Story = {
  render: () => (
    <DataCard
      title="Nenhum pedido"
      subtitle="Mude os filtros ou aguarde novos pedidos"
      fields={[]}
    />
  ),
};

/** **DataCard** showcase — all props */
export const DataCardShowcase: Story = {
  render: () => (
    <div className="max-w-sm flex flex-col gap-3">
      <DataCard
        title="Ana Lima"
        subtitle="ORD-001 · Mesa 3"
        badge={<Badge variant="warning">Pendente</Badge>}
        fields={[
          { label: "Itens", value: "3 itens" },
          { label: "Total", value: "R$ 89,90" },
          { label: "Criado em", value: "09/04/2026" },
          { label: "Garçom", value: "João" },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Pencil size={14} className="mr-1" /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={14} className="mr-1" /> Cancelar
            </Button>
          </>
        }
      />

      <DataCard
        title="Bruno Sousa"
        subtitle="ORD-002 · Mesa 7"
        badge={<Badge variant="info">Preparando</Badge>}
        fields={[
          { label: "Itens", value: "5 itens" },
          { label: "Total", value: "R$ 142,00" },
        ]}
      />
    </div>
  ),
};

/** **Mobile viewport** — switch to card view at 390px */
export const MobileViewport: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
  render: Auto.render,
};
