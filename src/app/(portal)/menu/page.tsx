import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Cardápio</Text>
        <Text variant="sm" muted className="mt-1">
          Gerenciamento de itens, categorias e preços.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. Permitirá criar, editar e organizar os
        itens do cardápio do restaurante selecionado.
      </Text>
    </div>
  );
}
