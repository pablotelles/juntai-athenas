import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function TablesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Mesas</Text>
        <Text variant="sm" muted className="mt-1">
          Gerenciamento de mesas e ocupação do salão.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. Mostrará o mapa de mesas, status de
        ocupação e controle de reservas.
      </Text>
    </div>
  );
}
