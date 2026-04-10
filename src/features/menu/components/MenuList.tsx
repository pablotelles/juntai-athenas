"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { Text } from "@/components/primitives/text/Text";
import { Button } from "@/components/primitives/button/Button";
import { useToast } from "@/contexts/toast/ToastProvider";
import { useMenu, useCreateMenu } from "../hooks";
import { MenuCard } from "./MenuCard";
import { CreateMenuModal } from "./CreateMenuModal";
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

  const { data: menus, isLoading } = useMenu(restaurantId, locationId);
  const createMenu = useCreateMenu(restaurantId);

  const handleCreate = async (values: MenuFormValues) => {
    await createMenu.mutateAsync(values);
    toast.success("Cardápio criado!", {
      description: `"${values.name}" foi adicionado.`,
    });
  };

  const handleManage = (menu: Menu) => {
    const loc = locationId ?? menu.locationId ?? "";
    router.push(`/menu/${menu.id}?locationId=${loc}`);
  };

  const handleToggleActive = (menu: Menu) => {
    // TODO: implementar PATCH /menus/:id quando endpoint disponível
    toast.info(`${menu.isActive ? "Desativando" : "Ativando"} "${menu.name}"…`);
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
        >
          <Plus className="h-4 w-4" />
          Novo cardápio
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-16 rounded-lg border border-border bg-secondary/30 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && locationId && (!menus || menus.length === 0) && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <BookOpen size={32} className="opacity-40" />
          <Text variant="sm">Nenhum cardápio cadastrado para esta filial.</Text>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            Criar primeiro cardápio
          </Button>
        </div>
      )}

      {/* List */}
      {menus?.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onManage={handleManage}
          onToggleActive={handleToggleActive}
        />
      ))}

      <CreateMenuModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        restaurantId={restaurantId}
        onSubmit={handleCreate}
      />
    </div>
  );
}
