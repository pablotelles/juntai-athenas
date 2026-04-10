import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";

const meta: Meta<typeof FilterChip> = {
  title: "Primitives/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterChip>;

export const States: Story = {
  render: () => {
    const [active, setActive] = React.useState("todas");
    return (
      <div className="flex flex-wrap gap-2">
        {[
          ["todas", "Todas", 12],
          ["livre", "Livres", 6],
          ["ocupada", "Ocupadas", 3],
          ["reservada", "Reservadas", 2],
        ].map(([key, label, count]) => {
          const value = String(key);
          return (
            <FilterChip
              key={value}
              active={active === value}
              count={Number(count)}
              onClick={() => setActive(value)}
            >
              {label}
            </FilterChip>
          );
        })}
      </div>
    );
  },
};
