import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Restaurantes</Text>
        <Text variant="sm" muted className="mt-1">
          Lista de restaurantes da plataforma ou do grupo.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. Exibirá todos os restaurantes do
        contexto ativo (platform → todos, group → do grupo).
      </Text>
    </div>
  );
}
