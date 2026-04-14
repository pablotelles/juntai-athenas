"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { Button } from "@/components/primitives/button/Button";
import { FAB } from "@/components/primitives/fab/FAB";
import { ConfirmDialog } from "@/components/shared/confirm-dialog/ConfirmDialog";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useMenu, useCreateMenu, usePatchMenu, useDeleteMenu } from "../hooks";
import { MenuCard } from "./MenuCard";
import { MenuFormModal } from "./MenuFormModal";
import type { MenuFormValues } from "../schemas";
import type { Menu } from "@juntai/types";

interface MenuListProps {
  restaurantId: string;
  locationId: string | null;
}

export function MenuList({ restaurantId, locationId }: MenuListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Menu | null>(null);

  const { data: menus, isLoading } = useMenu(restaurantId, locationId);
  const createMenu = useCreateMenu(restaurantId);
  const patchMenu = usePatchMenu(restaurantId);
  const deleteMenu = useDeleteMenu(restaurantId);

  const handleCreate = async (values: MenuFormValues) => {
    await createMenu.mutateAsync(values);
    toast.success("Cardápio criado!", { description: `"${values.name}" foi adicionado.` });
  };

  const handleEdit = async (values: { name: string }) => {
    if (!editTarget) return;
    await patchMenu.mutateAsync({
      menuId: editTarget.id,
      body: { restaurantId, name: values.name },
    });
    toast.success("Cardápio atualizado");
    setEditTarget(null);
  };

  const handleToggleActive = (menu: Menu) => {
    patchMenu.mutate(
      { menuId: menu.id, body: { restaurantId, isActive: !menu.isActive } },
      {
        onSuccess: () =>
          toast.success(menu.isActive ? "Cardápio desativado" : "Cardápio ativado"),
        onError: () => toast.error("Erro ao atualizar cardápio"),
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMenu.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Cardápio excluído", {
          description: `"${deleteTarget.name}" removido.`,
        });
        setDeleteTarget(null);
      },
      onError: () => toast.error("Erro ao excluir cardápio"),
    });
  };

  const handleManage = (menu: Menu) => {
    const loc = locationId ?? menu.locationId ?? "";
    const locQuery = loc ? `?locationId=${loc}` : "";

    if (menu.style === "flat") {
      // Para menus flat, navegar direto para os itens da categoria _default.
      // Os dados do menu já estão carregados — pegar a primeira (e única) categoria.
      const defaultCategory = menus
        ?.find((m) => m.id === menu.id)
        ?.categories[0];

      if (defaultCategory) {
        router.push(`/menu/${menu.id}/${defaultCategory.id}${locQuery}`);
        return;
      }
      // Fallback: ir para a página intermediária que tem o guard de redirect
    }

    router.push(`/menu/${menu.id}${locQuery}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text variant="sm" muted>
          {locationId
            ? `${menus?.length ?? 0} cardápio${(menus?.length ?? 0) !== 1 ? "s" : ""}`
            : "Selecione uma filial"}
        </Text>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          disabled={!locationId}
          className="hidden lg:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Novo cardápio
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-16 rounded-lg border border-border bg-secondary/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && locationId && (!menus || menus.length === 0) && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <BookOpen size={32} className="opacity-40" />
          <Text variant="sm">Nenhum cardápio cadastrado para esta filial.</Text>
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            Criar primeiro cardápio
          </Button>
        </div>
      )}

      {menus?.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onManage={handleManage}
          onToggleActive={handleToggleActive}
          onEdit={setEditTarget}
          onDelete={setDeleteTarget}
        />
      ))}

      {/* Create modal */}
      <MenuFormModal
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        restaurantId={restaurantId}
        onSubmit={handleCreate}
      />

      {/* Edit modal */}
      {editTarget && (
        <MenuFormModal
          mode="edit"
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          initialName={editTarget.name}
          initialStyle={editTarget.style}
          onSubmit={handleEdit}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir cardápio"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDeleteConfirm}
        loading={deleteMenu.isPending}
      />

      {locationId && (
        <FAB label="Novo cardápio" onClick={() => setCreateOpen(true)} />
      )}
    </div>
  );
}
