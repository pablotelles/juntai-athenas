import { ActiveContextBanner } from "@/components/compositions/context-display/ActiveContextBanner";
import { Text } from "@/components/primitives/text/Text";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Text variant="h2">Pedidos</Text>
        <Text variant="sm" muted className="mt-1">
          Gerenciamento de pedidos em tempo real.
        </Text>
      </div>
      <ActiveContextBanner />
      <Text variant="sm" muted>
        Esta página está em construção. Exibirá os pedidos do restaurante
        selecionado no contexto ativo.
      </Text>
    </div>
  );
}
