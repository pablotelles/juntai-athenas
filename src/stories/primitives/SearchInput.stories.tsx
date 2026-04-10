import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchInput } from "@/components/primitives/search-input/SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Primitives/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div className="max-w-md">
        <SearchInput value={value} onChange={setValue} placeholder="Buscar mesa por nome" />
      </div>
    );
  },
};
