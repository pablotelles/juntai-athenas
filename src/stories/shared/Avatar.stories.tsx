import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "@/components/shared/avatar/Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Shared/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { fallback: "JP" },
};

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=12",
    alt: "João Paulo",
    fallback: "JP",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar fallback="SM" size="sm" />
      <Avatar fallback="MD" size="md" />
      <Avatar fallback="LG" size="lg" />
    </div>
  ),
};

export const FallbackInitials: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar fallback="AB" />
      <Avatar fallback="CD" />
      <Avatar fallback="EF" />
      <Avatar fallback="GH" />
    </div>
  ),
};
