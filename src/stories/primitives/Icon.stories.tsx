import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Home,
  Settings,
  Bell,
  Search,
  User,
  Trash2,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import { Icon } from "@/components/primitives/icon/Icon";

const meta: Meta<typeof Icon> = {
  title: "Primitives/Icon",
  component: Icon,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: { icon: Home, size: 20 },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Icon icon={Bell} size={12} />
      <Icon icon={Bell} size={16} />
      <Icon icon={Bell} size={20} />
      <Icon icon={Bell} size={24} />
      <Icon icon={Bell} size={32} />
      <Icon icon={Bell} size={40} />
    </div>
  ),
};

export const Various: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Icon icon={Home} size={20} />
      <Icon icon={Settings} size={20} />
      <Icon icon={Bell} size={20} />
      <Icon icon={Search} size={20} />
      <Icon icon={User} size={20} />
      <Icon icon={Trash2} size={20} className="text-destructive" />
      <Icon icon={ShoppingBag} size={20} />
      <Icon icon={CheckCircle} size={20} className="text-success" />
    </div>
  ),
};
