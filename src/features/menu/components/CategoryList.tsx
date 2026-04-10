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
import { useToast } from "@/contexts/toast/ToastProvider";
import { useMenu, useCreateCategory, usePatchCategory } from "../hooks";
import { CategoryItem } from "./CategoryItem";
import { CreateCategoryModal } from "./CreateCategoryModal";
import type { CategoryFormValues } from "../schemas";
import type { MenuWithCategories } from "@juntai/types";
import type { CategoryWithItems } from "./CategoryItem";

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

  const { data: menus, isLoading } = useMenu(restaurantId, locationId);
  const createCategory = useCreateCategory(menuId, restaurantId);
  const patchCategory = usePatchCategory(restaurantId);

  // Derivar categorias do menu correto
  const menu: MenuWithCategories | undefined = menus?.find((m) => m.id === menuId);
  const [orderedCategories, setOrderedCategories] = React.useState<CategoryWithItems[]>([]);

  React.useEffect(() => {
    if (menu) {
      setOrderedCategories([...menu.categories].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [menu]);

  // dnd-kit sensors — TouchSensor enables drag on mobile touch screens
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      // Require 8px movement before activating to allow tap-to-navigate
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCategories.findIndex((c) => c.id === active.id);
    const newIndex = orderedCategories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(orderedCategories, oldIndex, newIndex);
    setOrderedCategories(reordered);

    // Persistir nova ordem
    reordered.forEach((cat, index) => {
      if (cat.displayOrder !== index) {
        patchCategory.mutate({
          categoryId: cat.id,
          body: { restaurantId, displayOrder: index },
        });
      }
    });
  };

  const handleCreate = async (values: CategoryFormValues) => {
    await createCategory.mutateAsync({ restaurantId, name: values.name });
    toast.success("Categoria criada!", { description: `"${values.name}" adicionada.` });
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
          toast.success(
            active ? "Categoria ativada" : "Categoria desativada",
          ),
        onError: () => toast.error("Erro ao atualizar categoria"),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-14 rounded-lg border border-border bg-secondary/30 animate-pulse"
          />
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
        {/* Desktop: inline button. Mobile: replaced by FAB below */}
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
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CreateCategoryModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <FAB label="Nova categoria" onClick={() => setCreateOpen(true)} />
    </div>
  );
}
