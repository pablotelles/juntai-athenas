"use client";

import * as React from "react";
import { Text } from "@/components/primitives/text/Text";
import { CategoryNav } from "./CategoryNav";
import { MenuItemCard } from "./MenuItemCard";
import { ModifierSheet } from "./ModifierSheet";
import { useGuestMenu } from "@/features/guest/hooks";
import type { MenuItem, MenuWithCategories } from "@juntai/types";

// ─── Section model ────────────────────────────────────────────────────────────
// Abstração que unifica "categoria de menu categorized" e "menu flat" numa
// única estrutura que o rendering não precisa distinguir.

interface MenuSection {
  id: string;        // âncora de scroll: "menu-{id}" ou "cat-{id}"
  label: string;     // nome exibido no nav e como header de seção
  items: MenuItem[];
}

function buildSections(menus: MenuWithCategories[]): MenuSection[] {
  return menus.flatMap((menu) => {
    if (menu.style === "flat") {
      // Todos os itens do menu (de qualquer categoria, incluindo _default)
      // são expostos como uma única seção com o nome do menu como header.
      const items = menu.categories
        .flatMap((cat) => cat.items)
        .filter((item) => item.isAvailable);

      return items.length > 0
        ? [{ id: `menu-${menu.id}`, label: menu.name, items }]
        : [];
    }

    // Categorized: uma seção por categoria visível (exclui _default por segurança)
    return menu.categories
      .filter((cat) => cat.isActive && cat.name !== "_default")
      .map((cat) => ({
        id: `cat-${cat.id}`,
        label: cat.name,
        items: cat.items.filter((item) => item.isAvailable),
      }))
      .filter((section) => section.items.length > 0);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MenuBrowser() {
  const { data: menus = [], isLoading, error } = useGuestMenu();
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  const sections = React.useMemo(() => buildSections(menus), [menus]);

  // Seção ativa padrão
  React.useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  // Scroll para seção ao clicar no nav
  const handleSectionSelect = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Rastrear seção ativa no scroll
  const sectionRefs = React.useRef<Map<string, HTMLElement>>(new Map());

  React.useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );

    const refs = sectionRefs.current;
    refs.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

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

  if (sections.length === 0) {
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

  // CategoryNav espera { id, name } — adaptar sections para esse shape
  const navItems = sections.map((s) => ({ id: s.id, name: s.label }));

  return (
    <>
      {/* Sticky section nav */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <CategoryNav
          categories={navItems}
          activeId={activeSectionId}
          onSelect={handleSectionSelect}
        />
      </div>

      {/* Menu content */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(section.id, el);
              else sectionRefs.current.delete(section.id);
            }}
            className="px-4 py-4"
          >
            <Text
              variant="sm"
              className="font-bold mb-3 text-muted-foreground uppercase tracking-wide"
            >
              {section.label}
            </Text>
            <div className="flex flex-col gap-2">
              {section.items.map((item) => (
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
