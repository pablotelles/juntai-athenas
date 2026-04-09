"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  CreditCard,
  Settings,
  BarChart2,
} from "lucide-react";
import { Avatar } from "@/components/shared/avatar/Avatar";
import { Button } from "@/components/primitives/button/Button";
import {
  PageLayout,
  PageContent,
} from "@/components/compositions/page-layout/PageLayout";
import { Sidebar } from "@/components/compositions/sidebar/Sidebar";
import { Header } from "@/components/compositions/header/Header";
import type { NavSection } from "@/components/compositions/sidebar/Sidebar";

const meta: Meta = {
  title: "Compositions/PageLayout",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj;

const navSections: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { label: "Pedidos", href: "/orders", icon: ShoppingBag, badge: 5 },
      { label: "Cardápio", href: "/menu", icon: UtensilsCrossed },
      { label: "Financeiro", href: "/finance", icon: CreditCard },
    ],
  },
  {
    title: "Relatórios",
    items: [{ label: "Análises", href: "/reports", icon: BarChart2 }],
  },
  {
    title: "Sistema",
    items: [{ label: "Configurações", href: "/settings", icon: Settings }],
  },
];

export const Default: Story = {
  render: () => (
    <PageLayout
      sidebar={
        <Sidebar
          sections={navSections}
          logo={<span className="text-white font-bold text-lg">Juntai</span>}
          footer={
            <div className="flex items-center gap-2 p-2">
              <Avatar fallback="JP" size="sm" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-sidebar-fg-active truncate">
                  João Paulo
                </span>
                <span className="text-[10px] text-sidebar-fg truncate">
                  joao@juntai.com
                </span>
              </div>
            </div>
          }
        />
      }
    >
      <Header
        title="Pedidos"
        description="Gerencie os pedidos em tempo real"
        actions={<Button>Novo pedido</Button>}
      />
      <PageContent>
        <div className="grid gap-4">
          <p className="text-muted-foreground text-sm">
            Conteúdo da página aqui.
          </p>
        </div>
      </PageContent>
    </PageLayout>
  ),
};
