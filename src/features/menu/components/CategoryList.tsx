"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { FolderOpen, Plus } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { Button } from "@/components/primitives/button/Button";
import { FAB } from "@/components/primitives/fab/FAB";
import { ConfirmDialog } from "@/components/shared/confirm-dialog/ConfirmDialog";
import { useToast } from "@/contexts/toast/ToastProvider";
import {
  useMenu,
  useCreateCategory,
  usePatchCategory,
  useDeleteCategory,
} from "../hooks";
import { CategoryItem, type CategoryWithItems } from "./CategoryItem";
import { CategoryFormModal } from "./CategoryFormModal";
import type { CategoryFormValues } from "../schemas";
import type { MenuWithCategories } from "@juntai/types";

interface CategoryListProps {
  menuId: string;
  restaurantId: string;
  locationId: string | null;
}

export function CategoryList({
  menuId,
  restaurantId,
  locationId,
}: CategoryListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<CategoryWithItems | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryWithItems | null>(null);

  const { data: menus, isLoading } = useMenu(restaurantId, locationId);
  const createCategory = useCreateCategory(menuId, restaurantId);
  const patchCategory = usePatchCategory(restaurantId);
  const deleteCategory = useDeleteCategory(restaurantId);

  const menu: MenuWithCategories | undefined = menus?.find((m) => m.id === menuId);
  const [orderedCategories, setOrderedCategories] = React.useState<CategoryWithItems[]>([]);

  React.useEffect(() => {
    if (menu) {
      setOrderedCategories(
        [...menu.categories].sort((a, b) => a.displayOrder - b.displayOrder),
      );
    }
  }, [menu]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedCategories.findIndex((c) => c.id === active.id);
    const newIndex = orderedCategories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(orderedCategories, oldIndex, newIndex);
    setOrderedCategories(reordered);
    reordered.forEach((cat, index) => {
      if (cat.displayOrder !== index) {
        patchCategory.mutate({ categoryId: cat.id, body: { restaurantId, displayOrder: index } });
      }
    });
  };

  const handleCreate = async (values: CategoryFormValues) => {
    await createCategory.mutateAsync({ restaurantId, name: values.name });
    toast.success("Categoria criada!", { description: `"${values.name}" adicionada.` });
  };

  const handleEdit = async (values: CategoryFormValues) => {
    if (!editTarget) return;
    await patchCategory.mutateAsync({
      categoryId: editTarget.id,
      body: { restaurantId, name: values.name },
    });
    toast.success("Categoria atualizada");
    setEditTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Categoria excluída", {
          description: `"${deleteTarget.name}" removida.`,
        });
        setDeleteTarget(null);
      },
      onError: () => toast.error("Erro ao excluir categoria"),
    });
  };

  const handleNavigate = (category: CategoryWithItems) => {
    const loc = locationId ?? "";
    router.push(`/menu/${menuId}/${category.id}?locationId=${loc}`);
  };

  const handleToggleActive = (category: CategoryWithItems, active: boolean) => {
    patchCategory.mutate(
      { categoryId: category.id, body: { restaurantId, isActive: active } },
      {
        onSuccess: () =>
          toast.success(active ? "Categoria ativada" : "Categoria desativada"),
        onError: () => toast.error("Erro ao atualizar categoria"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-14 rounded-lg border border-border bg-secondary/30 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Text variant="sm" muted>
          {orderedCategories.length} categoria{orderedCategories.length !== 1 ? "s" : ""}
        </Text>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="hidden lg:inline-flex">
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {orderedCategories.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <FolderOpen size={32} className="opacity-40" />
          <Text variant="sm">Nenhuma categoria neste cardápio.</Text>
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            Criar primeira categoria
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {orderedCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onNavigate={handleNavigate}
                  onToggleActive={handleToggleActive}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create modal */}
      <CategoryFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreate}
      />

      {/* Edit modal */}
      <CategoryFormModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        mode="edit"
        initialValues={editTarget ? { name: editTarget.name } : undefined}
        onSubmit={handleEdit}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDeleteConfirm}
        loading={deleteCategory.isPending}
      />

      <FAB label="Nova categoria" onClick={() => setCreateOpen(true)} />
    </div>
  );
}
