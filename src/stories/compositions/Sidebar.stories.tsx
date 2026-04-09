"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  CreditCard,
  Settings,
  BarChart2,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/shared/avatar/Avatar";
import { Sidebar } from "@/components/compositions/sidebar/Sidebar";
import type { NavSection } from "@/components/compositions/sidebar/Sidebar";

const meta: Meta<typeof Sidebar> = {
  title: "Compositions/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const restaurantSections: NavSection[] = [
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

const adminSections: NavSection[] = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: "Restaurantes",
        href: "/admin/restaurants",
        icon: UtensilsCrossed,
      },
      { label: "Usuários", href: "/admin/users", icon: Users },
      { label: "Financeiro", href: "/admin/finance", icon: CreditCard },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configurações", href: "/admin/settings", icon: Settings },
    ],
  },
];

const logo = <span className="text-white font-bold text-lg">Juntai</span>;

const footer = (
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
);

export const RestaurantPortal: Story = {
  render: () => (
    <div className="h-screen">
      <Sidebar sections={restaurantSections} logo={logo} footer={footer} />
    </div>
  ),
};

export const AdminGlobal: Story = {
  render: () => (
    <div className="h-screen">
      <Sidebar sections={adminSections} logo={logo} footer={footer} />
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div className="h-screen">
      <Sidebar
        sections={restaurantSections}
        logo={logo}
        footer={footer}
        collapsed
      />
    </div>
  ),
};

/** Sidebar rendered at mobile width — in production this is the drawer content */
export const MobileDrawer: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
  render: () => (
    <div className="h-screen">
      <Sidebar sections={restaurantSections} logo={logo} footer={footer} />
    </div>
  ),
};
