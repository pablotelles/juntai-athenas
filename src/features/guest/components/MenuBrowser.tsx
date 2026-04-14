"use client";

import * as React from "react";
import { Text } from "@/components/primitives/text/Text";
import { CategoryNav } from "./CategoryNav";
import { MenuItemCard } from "./MenuItemCard";
import { ModifierSheet } from "./ModifierSheet";
import { useGuestMenu } from "@/features/guest/hooks";
import type { MenuItem } from "@juntai/types";

export function MenuBrowser() {
  const { data: menus = [], isLoading, error } = useGuestMenu();
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  // Flatten all categories across all active menus
  const categories = menus.flatMap((menu) => menu.categories);

  // Set default active category
  React.useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Scroll to category section when selected from nav
  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    const el = document.getElementById(`category-${categoryId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Track active category on scroll
  const sectionRefs = React.useRef<Map<string, HTMLElement>>(new Map());

  React.useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id.replace("category-", ""));
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    const refs = sectionRefs.current;
    refs.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
        <Text variant="sm" className="font-medium">
          Erro ao carregar o cardápio
        </Text>
        <Text variant="xs" muted>
          Tente recarregar a página.
        </Text>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
        <Text variant="sm" className="font-medium">
          Cardápio não disponível
        </Text>
        <Text variant="xs" muted>
          Nenhum item publicado para este local.
        </Text>
      </div>
    );
  }

  return (
    <>
      {/* Sticky category nav */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <CategoryNav
          categories={categories}
          activeId={activeCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Menu content */}
      <div className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            ref={(el) => {
              if (el) sectionRefs.current.set(category.id, el);
              else sectionRefs.current.delete(category.id);
            }}
            className="px-4 py-4"
          >
            <Text
              variant="sm"
              className="font-bold mb-3 text-muted-foreground uppercase tracking-wide"
            >
              {category.name}
            </Text>
            <div className="flex flex-col gap-2">
              {category.items
                .filter((item) => item.isAvailable)
                .map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onOpenModifiers={setSelectedItem}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>

      {/* Modifier sheet */}
      <ModifierSheet
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
