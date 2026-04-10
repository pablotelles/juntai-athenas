import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SlidersHorizontal } from "lucide-react";
import { Subheader, SubheaderGroup } from "@/components/compositions/subheader/Subheader";
import { SearchInput } from "@/components/primitives/search-input/SearchInput";
import { FilterChip } from "@/components/primitives/filter-chip/FilterChip";
import { Button } from "@/components/primitives/button/Button";

const meta: Meta<typeof Subheader> = {
  title: "Compositions/Subheader",
  component: Subheader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Subheader>;

export const Default: Story = {
  render: () => (
    <Subheader>
      <SubheaderGroup>
        <div className="min-w-60 flex-1">
          <SearchInput value="" onChange={() => undefined} placeholder="Buscar mesas" />
        </div>
        <FilterChip active>Todas</FilterChip>
        <FilterChip>Livres</FilterChip>
      </SubheaderGroup>
      <Button variant="outline">
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
      </Button>
    </Subheader>
  ),
};
