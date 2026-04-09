"use client";

import * as React from "react";
import { Users } from "lucide-react";
import {
  DataTable,
  type ColumnDef,
} from "@/components/compositions/data-table/DataTable";
import { Badge, type BadgeVariant } from "@/components/primitives/badge/Badge";
import { Input } from "@/components/primitives/input/Input";
import { Text } from "@/components/primitives/text/Text";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/shared/select/Select";
import { useUsers } from "@/features/users/hooks";
import type {
  MembershipRole,
  UserWithMemberships,
} from "@/features/users/types";

// ── Role helpers ──────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<MembershipRole, string> = {
  admin: "Admin",
  owner: "Proprietário",
  manager: "Gerente",
  waiter: "Garçom",
};

const ROLE_VARIANT: Record<MembershipRole, BadgeVariant> = {
  admin: "destructive",
  owner: "info",
  manager: "warning",
  waiter: "default",
};

const ALL_ROLES: MembershipRole[] = ["admin", "owner", "manager", "waiter"];

// ── Columns ───────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef<UserWithMemberships>[] = [
  {
    key: "name",
    header: "Nome",
    sortable: true,
    cell: (row) => (
      <span className="font-medium">
        {row.name ?? <em className="text-muted-foreground">—</em>}
      </span>
    ),
  },
  {
    key: "email",
    header: "E-mail",
    cell: (row) => (
      <Text variant="sm" muted={!row.email}>
        {row.email ?? "—"}
      </Text>
    ),
  },
  {
    key: "roles",
    header: "Funções",
    cell: (row) => {
      if (row.memberships.length === 0) {
        return (
          <Text variant="xs" muted>
            Sem função
          </Text>
        );
      }
      return (
        <div className="flex flex-wrap gap-1">
          {row.memberships.map((m) => (
            <Badge key={m.id} variant={ROLE_VARIANT[m.role]}>
              {ROLE_LABEL[m.role]}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    key: "type",
    header: "Tipo",
    cell: (row) => (
      <Badge variant={row.type === "user" ? "success" : "default"}>
        {row.type === "user" ? "Usuário" : "Convidado"}
      </Badge>
    ),
  },
  {
    key: "createdAt",
    header: "Cadastrado em",
    cell: (row) => (
      <Text variant="xs" muted>
        {new Date(row.createdAt).toLocaleDateString("pt-BR")}
      </Text>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export function UsersView() {
  const [nameInput, setNameInput] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<MembershipRole | "ALL">(
    "ALL",
  );
  const [page, setPage] = React.useState(1);

  // Debounce text inputs to avoid a request per keystroke
  const [debouncedName, setDebouncedName] = React.useState("");
  const [debouncedEmail, setDebouncedEmail] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedName(nameInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [nameInput]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedEmail(emailInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [emailInput]);

  const { data, isLoading } = useUsers({
    name: debouncedName || undefined,
    email: debouncedEmail || undefined,
    role: roleFilter === "ALL" ? undefined : roleFilter,
    page,
    limit: PAGE_SIZE,
  });

  function handleRoleChange(value: string) {
    setRoleFilter(value as MembershipRole | "ALL");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filtrar por nome…"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="w-52"
        />
        <Input
          placeholder="Filtrar por e-mail…"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="w-60"
        />
        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as funções</SelectItem>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        data={data?.data ?? []}
        columns={COLUMNS}
        isLoading={isLoading}
        pagination={
          data
            ? {
                page,
                pageSize: PAGE_SIZE,
                total: data.total,
                onPageChange: setPage,
              }
            : undefined
        }
        emptyState={
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Users size={32} className="opacity-40" />
            <Text variant="sm">Nenhum usuário encontrado.</Text>
          </div>
        }
      />
    </div>
  );
}
