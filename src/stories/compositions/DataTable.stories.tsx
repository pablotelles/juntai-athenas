"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DataTable } from "@/components/compositions/data-table/DataTable";
import { Badge } from "@/components/primitives/badge/Badge";
import type {
  ColumnDef,
  RowAction,
} from "@/components/compositions/data-table/DataTable";
import { useState } from "react";

const meta: Meta<typeof DataTable> = {
  title: "Compositions/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// ─── Mock Data ────────────────────────────────────────────────────────────────

type Order = {
  id: string;
  table: string;
  items: number;
  total: string;
  status: "pending" | "preparing" | "delivered" | "cancelled";
};

const mockOrders: Order[] = [
  {
    id: "001",
    table: "Mesa 1",
    items: 3,
    total: "R$ 89,90",
    status: "pending",
  },
  {
    id: "002",
    table: "Mesa 4",
    items: 5,
    total: "R$ 142,00",
    status: "preparing",
  },
  {
    id: "003",
    table: "Mesa 7",
    items: 2,
    total: "R$ 55,50",
    status: "delivered",
  },
  {
    id: "004",
    table: "Mesa 2",
    items: 1,
    total: "R$ 22,00",
    status: "cancelled",
  },
  {
    id: "005",
    table: "Mesa 9",
    items: 4,
    total: "R$ 110,00",
    status: "preparing",
  },
];

const statusVariant = {
  pending: "warning",
  preparing: "info",
  delivered: "success",
  cancelled: "destructive",
} as const;

const statusLabel = {
  pending: "Pendente",
  preparing: "Preparando",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const columns: ColumnDef<Order>[] = [
  { key: "id", header: "Pedido #", sortable: true },
  { key: "table", header: "Mesa", sortable: true },
  { key: "items", header: "Itens", align: "right" },
  { key: "total", header: "Total", align: "right", sortable: true },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <Badge variant={statusVariant[row.status]} dot>
        {statusLabel[row.status]}
      </Badge>
    ),
  },
];

const rowActions: RowAction<Order>[] = [
  { label: "Ver detalhes", onClick: (row) => alert(`Ver pedido ${row.id}`) },
  {
    label: "Marcar como entregue",
    onClick: (row) => alert(`Entregue: ${row.id}`),
    hidden: (row) => row.status === "delivered",
  },
  {
    label: "Cancelar",
    onClick: (row) => alert(`Cancelar: ${row.id}`),
    destructive: true,
    hidden: (row) => row.status === "cancelled",
  },
];

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <DataTable data={mockOrders} columns={columns} rowActions={rowActions} />
  ),
};

export const Loading: Story = {
  render: () => <DataTable data={[]} columns={columns} isLoading />,
};

export const Empty: Story = {
  render: () => (
    <DataTable
      data={[]}
      columns={columns}
      emptyState="Nenhum pedido encontrado."
    />
  ),
};

export const WithPagination: Story = {
  render: function WithPaginationStory() {
    const [page, setPage] = useState(1);
    return (
      <DataTable
        data={mockOrders.slice((page - 1) * 2, page * 2)}
        columns={columns}
        rowActions={rowActions}
        pagination={{
          page,
          pageSize: 2,
          total: mockOrders.length,
          onPageChange: setPage,
        }}
      />
    );
  },
};

export const WithSelection: Story = {
  render: function WithSelectionStory() {
    const [selected, setSelected] = useState<Order[]>([]);
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {selected.length} selecionado(s):{" "}
          {selected.map((r) => r.id).join(", ")}
        </p>
        <DataTable
          data={mockOrders}
          columns={columns}
          rowActions={rowActions}
          selection={{
            selectedRows: selected,
            onSelectionChange: setSelected,
            rowId: (r) => r.id,
          }}
        />
      </div>
    );
  },
};
